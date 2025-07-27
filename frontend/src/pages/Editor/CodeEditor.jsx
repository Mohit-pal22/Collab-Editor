import { useActionState, useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useSocket from "../../socket/useSocket";
import socket from "../../socket/socket";
import Button from "../../components/Button"
import Sidebar from './components/Sidebar'
import Chat from './components/Chat'
import MainEditor from './components/Editor'
import { fetchDocument } from '../../apiCall/apiCalls'
import { useAuth } from '../../context/AuthContext';


function CodeEditor() {
  const [showSidebar, setShowSidebar] = useState(true)
  const [showChat, setShowChat] = useState(false)
  const [docData, setDocData] = useState(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { id } = useParams();
  const { user } = useAuth();


  const intilizeState = async () => {
    try {
      const res = await fetchDocument(id);
      setDocData(res.data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  const toggle = () => {
    setShowChat(!showChat);
    setShowSidebar(!showSidebar);
  }

  useSocket(id, user); // 🔌 Connects to socket
  useEffect(() => {
    intilizeState();
  }, [])

  if (loading) return <div>Loading...</div>
  if (!docData) return <div>Loading...</div>;
  if (error) return <div>{error}</div>
  return (
    <div className='flex overflow-hidden w-screen h-screen'>
      {/* button for chat and sidebar */}
      {!showSidebar && (<Button className={"fixed top-0 left-0 bg-red-700"} onClick={toggle} name="Sidbar" />)}
      {!showChat && (<Button className={"fixed top-0 right-0 bg-red-700"} onClick={toggle} name="Chat" />)}

      {/* Sidebar */}
      {showSidebar && (<Sidebar
        sharedWith={[docData.owner, ...docData.sharedWith]}
        onClick={toggle} />)}

      {/* Editor */}
      <MainEditor className='flex-grow text-center' data={docData} />

      {/* Chat */}
      {showChat && (<Chat onClick={toggle} />)}
    </div>
  )
}

export default CodeEditor