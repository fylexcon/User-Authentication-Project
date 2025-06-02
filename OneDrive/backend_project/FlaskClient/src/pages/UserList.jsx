import { useEffect, useState } from "react";

function UserList() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.role === "admin") {
          setRole("admin");
        }
      });
  }, []);

  const handleDelete = (username) => {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    
    if (window.confirm(`Are you sure you want to delete user "${username}"?`)) {
      fetch(`http://127.0.0.1:5000/users/${username}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requester: currentUser.username })
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.message) {
            setUsers(users.filter((u) => u.username !== username));
            setSelectedUser(null);
          } else {
            alert("Delete failed: " + data.error);
          }
        });
    }
  };

  const handleUserClick = (user) => {
    setSelectedUser(selectedUser?.username === user.username ? null : user);
  };

  const filteredUsers = users.filter((user) =>
    user.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div style={{ 
      maxWidth: "1000px",
      margin: "0 auto",
      padding: "2rem",
      background: "linear-gradient(135deg, #2b2d42 0%, #3c1642 100%)",
      borderRadius: "12px",
      boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
      backdropFilter: "blur(4px)",
      border: "1px solid rgba(255, 255, 255, 0.18)",
      position: "relative",
      overflow: "hidden",
      animation: "slideIn 0.5s ease-out"
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: "4px",
        background: "linear-gradient(90deg, #646cff, #9089fc, #646cff)",
        backgroundSize: "200% 100%",
        animation: "gradient 2s linear infinite"
      }} />
      
      <h2 style={{
        textAlign: "center", 
        color: "#646cff",
        fontSize: "2.2rem",
        marginBottom: "1.5rem",
        textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
        letterSpacing: "1px"
      }}>Admin Control Panel - User Management</h2>

      <div style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        marginBottom: "1.5rem"
      }}>
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: 1,
            padding: "0.8em",
            borderRadius: "8px",
            border: "1px solid rgba(100, 108, 255, 0.3)",
            backgroundColor: "rgba(36, 36, 36, 0.8)",
            color: "white",
            transition: "all 0.3s ease",
            outline: "none",
            fontSize: "1rem"
          }}
        />
        <div style={{
          padding: "0.8em",
          borderRadius: "8px",
          backgroundColor: "rgba(76, 175, 80, 0.1)",
          border: "1px solid rgba(76, 175, 80, 0.3)",
          color: "#4CAF50"
        }}>
          Total Users: {users.length}
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: selectedUser ? "2fr 1fr" : "1fr",
        gap: "1rem"
      }}>
        <div style={{
          background: "rgba(255, 255, 255, 0.05)",
          borderRadius: "8px",
          padding: "1rem",
          maxHeight: "600px",
          overflowY: "auto"
        }}>
          {filteredUsers.map((user, i) => (
            <div 
              key={i} 
              onClick={() => role === "admin" && handleUserClick(user)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "1rem",
                borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                transition: "all 0.3s ease",
                cursor: role === "admin" ? "pointer" : "default",
                backgroundColor: selectedUser?.username === user.username ? 
                  "rgba(100, 108, 255, 0.1)" : "transparent",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.05)"
                }
              }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem"
              }}>
                <div style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: user.role === "admin" ? 
                    "linear-gradient(45deg, #4CAF50, #81C784)" :
                    "linear-gradient(45deg, #646cff, #9089fc)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.2rem",
                  color: "white"
                }}>
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <div style={{color: "#646cff", fontWeight: "bold"}}>{user.username}</div>
                  <div style={{color: "#9089fc", fontSize: "0.9rem"}}>{user.email}</div>
                  <div style={{
                    color: user.role === "admin" ? "#4CAF50" : "#f3f4f6",
                    fontSize: "0.8rem",
                    fontWeight: "500",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}>
                    {user.role === "admin" && <span>👑</span>}
                    {user.role}
                  </div>
                </div>
              </div>
              
              {role === "admin" && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(user.username);
                  }}
                  style={{
                    background: "rgba(255, 70, 70, 0.2)",
                    color: "#ff4646",
                    border: "1px solid rgba(255, 70, 70, 0.3)",
                    padding: "0.5em 1em",
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    "&:hover": {
                      background: "rgba(255, 70, 70, 0.3)",
                      transform: "translateY(-2px)"
                    }
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>

        {selectedUser && (
          <div style={{
            background: "rgba(255, 255, 255, 0.05)",
            borderRadius: "8px",
            padding: "1.5rem",
            height: "fit-content"
          }}>
            <h3 style={{
              color: "#646cff",
              marginBottom: "1rem",
              borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
              paddingBottom: "0.5rem"
            }}>User Details</h3>
            <div style={{color: "#f3f4f6", marginBottom: "0.5rem"}}>
              <strong>Username:</strong> {selectedUser.username}
            </div>
            <div style={{color: "#f3f4f6", marginBottom: "0.5rem"}}>
              <strong>Email:</strong> {selectedUser.email}
            </div>
            <div style={{color: "#f3f4f6", marginBottom: "0.5rem"}}>
              <strong>Role:</strong> {selectedUser.role}
            </div>
            <div style={{color: "#f3f4f6", marginBottom: "1rem"}}>
              <strong>Status:</strong>{" "}
              <span style={{
                color: selectedUser.active ? "#4CAF50" : "#ff4646"
              }}>
                {selectedUser.active ? "Active" : "Inactive"}
              </span>
            </div>
            <button
              onClick={() => handleDelete(selectedUser.username)}
              style={{
                width: "100%",
                background: "rgba(255, 70, 70, 0.2)",
                color: "#ff4646",
                border: "1px solid rgba(255, 70, 70, 0.3)",
                padding: "0.8em",
                borderRadius: "6px",
                cursor: "pointer",
                transition: "all 0.3s ease",
                marginTop: "1rem",
                "&:hover": {
                  background: "rgba(255, 70, 70, 0.3)"
                }
              }}
            >
              Delete User
            </button>
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes gradient {
            0% { background-position: 0% 0%; }
            100% { background-position: 200% 0%; }
          }
          @keyframes slideIn {
            from { transform: translateY(-20px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
}

export default UserList;
