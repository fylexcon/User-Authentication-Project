import UserList from "./UserList";
import { useState, useEffect } from "react";

function AdminPage() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));

  if (!user || user.role !== "admin") {
    return <h2 style={{
      textAlign: "center",
      color: "#ff4646", 
      marginTop: "2rem",
      fontFamily: "'Segoe UI', sans-serif"
    }}>Admin Access Required</h2>;
  }

  return (
    <div style={{
      padding: "2rem",
      minHeight: "100vh",
      width: "100%", 
      backgroundColor: "#1a1a1a",
      backgroundImage: "linear-gradient(45deg, #1a1a1a 0%, #2d2d2d 100%)",
      color: "white"
    }}>
      <div style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem",
        backgroundColor: "rgba(255,255,255,0.05)",
        borderRadius: "15px",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)"
      }}>
        <h1 style={{
          textAlign: "center",
          color: "#646cff",
          marginBottom: "2rem", 
          fontSize: "2.5rem",
          fontFamily: "'Segoe UI', sans-serif",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)"
        }}>
          <span style={{marginRight: "1rem"}}>👑</span>
          Admin Control Panel
        </h1>
        
        <div style={{
          backgroundColor: "rgba(0,0,0,0.2)",
          padding: "2rem",
          borderRadius: "10px",
          border: "1px solid rgba(255,255,255,0.1)"
        }}>
          <h2 style={{
            marginBottom: "1.5rem",
            fontSize: "2.0rem",
            color: "#646cff",
            textAlign: "center",
            textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
            letterSpacing: "1px",
            background: "linear-gradient(90deg, #646cff, #9089fc)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            position: "relative"
          }}>User Management</h2>
          <UserList />
        </div>
      </div>
    </div>
  );
}

export default AdminPage;
