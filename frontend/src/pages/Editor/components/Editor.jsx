import "../styles/Editor.css"
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Button from '../../../components/Button';
import ShareModal from '../../../components/Modal/ShareModal';
import API from '../../../api';
import socket from '../../../socket/socket';
import { useAuth } from '../../../context/AuthContext';

const supportedLanguages = [
  'javascript',
  'python',
  'java',
  'c',
  'cpp',
  'typescript',
  'html',
  'css',
  'json',
  'markdown',
];

// Simple debounce utility
function debounce(func, delay) {
  let timer;
  return (...args) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => {
      func(...args);
    }, delay);
  };
}

function MainEditor({ className, data }) {
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [content, setContent] = useState('// code');
  const [isTitleEditable, setIsTitleEditable] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false)
  const [remoteCursors, setRemoteCursors] = useState({});
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const titleRef = useRef(title);
  const languageRef = useRef(language);
  const editorRef = useRef(null);


  useEffect(() => {
    titleRef.current = title;
  }, [title]);

  useEffect(() => {
    languageRef.current = language;
  }, [language]);


  // Initialize from props
  useEffect(() => {
    if (data) {
      setTitle(data.title || 'Untitled');
      setLanguage(data.language || 'javascript');
      setContent(data.content || '// code');
    }
  }, [data]);

  // Debounced content update
  const debouncedUpdateContent = useRef(
    debounce(async (newContent) => {
      try {
        await API.put(`/documents/${id}`, {
          title: titleRef.current || 'Untitled',
          language: languageRef.current || "javascript",
          content: newContent,
        });
        console.log('Content updated');
      } catch (error) {
        console.error('Error updating content:', error.message);
      }
    }, 1000)
  ).current;

  const handleEditorChange = (value) => {
    setContent(value);
    debouncedUpdateContent(value);
    socket.emit("send_code", { code: value, room: id });
    socket.emit("user_editing", { room: id, user });
  };

  const handleTitleToggle = async () => {
    if (isTitleEditable) {
      try {
        await API.put(`/documents/${id}`, {
          title,
          language,
          content,
        });
        console.log('Title updated');
      } catch (error) {
        console.error('Error updating title:', error.message);
      }
    }
    setIsTitleEditable(!isTitleEditable);
  };

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    try {
      await API.put(`/documents/${id}`, {
        title,
        language: newLang,
        content,
      });
      console.log('Language updated');
    } catch (error) {
      console.error('Error updating language:', error.message);
    }
  };

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    const decorations = [];

    Object.entries(remoteCursors).forEach(([uid, cursorData]) => {
      if (uid === user.id) return; // Skip your own cursor

      if (cursorData.position) {
        decorations.push({
          range: new window.monaco.Range(
            cursorData.position.lineNumber,
            cursorData.position.column,
            cursorData.position.lineNumber,
            cursorData.position.column
          ),
          options: {
            className: 'remote-cursor',
            afterContentClassName: 'remote-cursor-label',
          },
        });
      }

      if (cursorData.selection) {
        decorations.push({
          range: new window.monaco.Range(
            cursorData.selection.startLineNumber,
            cursorData.selection.startColumn,
            cursorData.selection.endLineNumber,
            cursorData.selection.endColumn
          ),
          options: {
            className: 'remote-selection',
            isWholeLine: false,
          },
        });
      }
    });

    const currentDecorations = editorRef.current.__remoteDecorations || [];
    const newDecorations = editor.deltaDecorations(currentDecorations, decorations);
    editorRef.current.__remoteDecorations = newDecorations;
  }, [remoteCursors, user.id]);


  // Code sync
  useEffect(() => {
    socket.on("receive_code", (incomingCode) => {
      setContent(incomingCode);
    });

    socket.on("receive_cursor_position", ({ userId, position }) => {
      setRemoteCursors(prev => ({
        ...prev,
        [userId]: {
          ...(prev[userId] || {}),
          position,
        }
      }));
    });

    socket.on("receive_cursor_selection", ({ userId, selection }) => {
      setRemoteCursors(prev => ({
        ...prev,
        [userId]: {
          ...(prev[userId] || {}),
          selection,
        }
      }));
    });

    return () => {
      socket.off("receive_code");
      socket.off("receive_cursor_position");
      socket.off("receive_cursor_selection");
    };
  }, []);

  return (
    <div className={`${className}`}>
      {showShareModal && (
        <ShareModal documentId={id} onClose={() => setShowShareModal(false)} />
      )}
      {/* Header */}
      <div className='editor-header flex justify-evenly bg-red-500 p-3'>
        <Button
          className='bg-red-600'
          onClick={() => navigate('/')}
          name='Exit'
        />
        <div className='flex gap-x-3 items-center'>
          <Button
            className='bg-gray-400'
            onClick={handleTitleToggle}
            name={isTitleEditable ? 'Save' : 'Edit'}
          />
          <input
            type='text'
            name='title'
            value={title}
            readOnly={!isTitleEditable}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus={isTitleEditable}
            className='bg-transparent text-white text-2xl font-bold text-center border border-white rounded-lg'
          />
          <select
            name='language'
            value={language}
            onChange={handleLanguageChange}
            className='bg-white text-black'
          >
            {supportedLanguages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <Button
          className='bg-blue-600'
          onClick={() => setShowShareModal(true)}
          name='Share'
        />
      </div>

      {/* Code Editor */}
      <div className='flex'>
        <Editor
          theme='vs-dark'
          height='100vh'
          width='80vw'
          className='flex-grow'
          language={language}
          value={content}
          onChange={handleEditorChange}
          onMount={(editor) => {
            editorRef.current = editor;

            editor.onDidChangeCursorPosition(() => {
              const position = editor.getPosition();
              socket.emit("cursor_position", { room: id, user, position });
            });

            editor.onDidChangeCursorSelection(() => {
              const selection = editor.getSelection();
              socket.emit("cursor_selection", { room: id, user, selection });
            });
          }}
        />

      </div>
    </div>
  );
}

export default MainEditor;
