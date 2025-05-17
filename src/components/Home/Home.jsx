import './Home.css';

function Home({ user, onLogout }) {
  return (
    <div className="home-container">
      <div className="home-content">
        <h1>Welcome to your Dashboard</h1>
        <div className="user-info">
          <h3>User Information</h3>
          <div className="user-detail">
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
            {user.roles && (
              <p><strong>Roles:</strong> {user.roles.join(', ')}</p>
            )}
          </div>
        </div>
        <button onClick={onLogout} className="logout-button">
          Logout
        </button>
      </div>
    </div>
  );
}

export default Home; 