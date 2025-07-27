import "./Sidebar.css";

const Sidebar = ({ collaborators = [], currentUser, currentlyEditingUsers = {} }) => {
  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>Collaborators</h3>
      </div>
      <ul className="collab-list">
        {collaborators.map((user) => (
          <li
            key={user._id}
            className={`collab-item ${user._id === currentUser._id ? "me" : ""}`}
          >
            <img
              src={`https://ui-avatars.com/api/?name=${user.name || user.email}&background=random`}
              alt="avatar"
              className="avatar"
            />
            <div className="collab-info">
              <span>{user.name || user.email}</span>
              {user._id === currentUser._id && <strong> (You)</strong>}
              {currentlyEditingUsers[user._id] && (
                <span className="editing-indicator">✍️ Editing...</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar;
