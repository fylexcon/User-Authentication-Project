import Login from "./pages/Login";
import Register from "./pages/Register";
import UserList from "./pages/UserList";

function App() {
  return (
    <div style={{ 
      padding: "2rem",
      fontFamily: "'Poppins', sans-serif",
      minHeight: "100vh",
      background: "linear-gradient(135deg, #1a1c2c 0%, #4a2c4c 100%)",
      color: "#f3f4f6",
      position: "relative",
      overflow: "hidden"
    }}>
      {/* Animated background elements */}
      <div style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: 0,
        background: "radial-gradient(circle at 50% 50%, rgba(76, 0, 255, 0.15) 0%, transparent 60%)",
        animation: "pulse 8s ease-in-out infinite"
      }} />
      
      <div className="floating-particles" />
      <div className="floating-particles-2" />
      
      <div style={{
        position: "relative",
        zIndex: 1
      }}>
        <h1 style={{
          textAlign: "center",
          background: "linear-gradient(90deg, #a78bfa, #c4b5fd)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "3.5rem",
          marginBottom: "2rem",
          textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
          position: "relative",
          fontWeight: "bold",
          letterSpacing: "2px"
        }}>
          Welcome
          <span style={{
            position: "absolute",
            bottom: "-15px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "150px",
            height: "4px",
            background: "linear-gradient(90deg, transparent, #a78bfa, #c4b5fd, transparent)",
            borderRadius: "2px",
            animation: "shimmer 2s infinite"
          }} />
        </h1>

        <section style={{ 
          marginBottom: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2.5rem",
          background: "rgba(255, 255, 255, 0.07)",
          borderRadius: "20px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transform: "translateY(0)",
          transition: "transform 0.3s ease",
          ":hover": {
            transform: "translateY(-5px)"
          }
        }}>
          <Login />
        </section>

        <div style={{
          position: "relative",
          margin: "4rem 0"
        }}>
          <hr style={{
            border: "none",
            height: "2px",
            background: "linear-gradient(90deg, transparent, #a78bfa, #c4b5fd, transparent)",
            margin: "2rem auto",
            width: "80%"
          }}/>
          <div style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "50px",
            height: "50px",
            background: "#1a1c2c",
            borderRadius: "50%",
            border: "2px solid #a78bfa",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 0 15px rgba(167, 139, 250, 0.3)",
            animation: "glow 2s infinite"
          }}>
            <span style={{
              color: "#a78bfa",
              fontWeight: "600",
              fontSize: "0.9rem"
            }}>OR</span>
          </div>
        </div>

        <section style={{ 
          marginTop: "2rem",
          maxWidth: "1200px",
          margin: "0 auto",
          padding: "2.5rem",
          background: "rgba(255, 255, 255, 0.07)",
          borderRadius: "20px",
          backdropFilter: "blur(12px)",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          transform: "translateY(0)",
          transition: "transform 0.3s ease",
          ":hover": {
            transform: "translateY(-5px)"
          }
        }}>
          <Register />
        </section>
      </div>

      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.5); opacity: 0.2; }
            100% { transform: scale(1); opacity: 0.5; }
          }

          @keyframes shimmer {
            0% { opacity: 0.5; }
            50% { opacity: 1; }
            100% { opacity: 0.5; }
          }

          @keyframes glow {
            0% { box-shadow: 0 0 15px rgba(167, 139, 250, 0.3); }
            50% { box-shadow: 0 0 25px rgba(167, 139, 250, 0.5); }
            100% { box-shadow: 0 0 15px rgba(167, 139, 250, 0.3); }
          }

          .floating-particles {
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: radial-gradient(circle, #a78bfa 1px, transparent 1px);
            background-size: 50px 50px;
            animation: particleFloat 20s linear infinite;
            opacity: 0.3;
          }

          .floating-particles-2 {
            position: absolute;
            width: 100%;
            height: 100%;
            background-image: radial-gradient(circle, #c4b5fd 1px, transparent 1px);
            background-size: 30px 30px;
            animation: particleFloat 15s linear infinite;
            opacity: 0.2;
          }

          @keyframes particleFloat {
            0% { transform: translateY(0); }
            100% { transform: translateY(-100%); }
          }
        `}
      </style>
    </div>
  );
}

export default App;
