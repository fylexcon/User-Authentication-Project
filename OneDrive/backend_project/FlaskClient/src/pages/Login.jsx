import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { loginUser } from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const result = await loginUser({ username, password });
    console.log("Login response:", result);

    if (result.message) {
      setMessage(
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          animation: "fadeIn 0.5s ease-out"
        }}>
          <span style={{fontSize: "1.2em"}}>✅</span>
          <span style={{
            color: "#4CAF50", 
            fontWeight: "bold", 
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
          }}>
            Welcome {result.username}!
          </span>
        </div>
      );
      localStorage.setItem("user", JSON.stringify(result));

      if (result.role === "admin") {
        setTimeout(() => navigate("/admin"), 1000);
      }
    } else {
      setMessage(
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          animation: "shake 0.5s ease-in-out"
        }}>
          <span style={{fontSize: "1.2em"}}>❌</span>
          <span style={{
            color: "#ff4646", 
            fontWeight: "bold", 
            textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
          }}>
            Invalid username or password
          </span>
        </div>
      );
    }
    setIsLoading(false);
  };

  return (
    <div style={{ 
      maxWidth: "400px", 
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
      }}>Login</h2>
      <form onSubmit={handleSubmit} style={{display: "flex", flexDirection: "column", gap: "1rem"}}>
        <input 
          placeholder="Username" 
          onChange={(e) => setUsername(e.target.value)}
          style={{
            padding: "0.8em",
            borderRadius: "8px",
            border: "1px solid rgba(100, 108, 255, 0.3)",
            backgroundColor: "rgba(36, 36, 36, 0.8)",
            color: "white",
            transition: "all 0.3s ease",
            outline: "none",
            fontSize: "1rem",
            "&:focus": {
              borderColor: "#646cff",
              boxShadow: "0 0 0 2px rgba(100, 108, 255, 0.2)",
              transform: "translateY(-2px)"
            }
          }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          onChange={(e) => setPassword(e.target.value)}
          style={{
            padding: "0.8em",
            borderRadius: "8px",
            border: "1px solid rgba(100, 108, 255, 0.3)",
            backgroundColor: "rgba(36, 36, 36, 0.8)",
            color: "white",
            transition: "all 0.3s ease",
            outline: "none",
            fontSize: "1rem",
            "&:focus": {
              borderColor: "#646cff",
              boxShadow: "0 0 0 2px rgba(100, 108, 255, 0.2)",
              transform: "translateY(-2px)"
            }
          }}
        />
        <button 
          type="submit"
          disabled={isLoading}
          style={{
            background: "linear-gradient(45deg, #646cff 0%, #9089fc 100%)",
            color: "white",
            border: "none",
            padding: "1em",
            borderRadius: "8px",
            cursor: isLoading ? "wait" : "pointer",
            fontWeight: "bold",
            transition: "all 0.3s ease",
            textTransform: "uppercase",
            letterSpacing: "2px",
            position: "relative",
            overflow: "hidden",
            "&:hover": {
              transform: "translateY(-2px)",
              boxShadow: "0 5px 15px rgba(100, 108, 255, 0.4)"
            },
            "&:active": {
              transform: "translateY(1px)"
            }
          }}
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
      <p style={{textAlign: "center", marginTop: "1.5rem"}}>{message}</p>
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
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
          }
        `}
      </style>
    </div>
  );
}
