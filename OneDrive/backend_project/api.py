from flask import Flask, request, jsonify
from flask_cors import CORS
from user_auth import UserRepository, User, UserRole

app = Flask(__name__)
CORS(app, origins="*", methods=["GET", "POST", "DELETE", "PUT", "OPTIONS"], allow_headers="*")


repo = UserRepository()

@app.route("/users", methods=["GET"])
def get_all_users():
    users = repo.get_all_users()
    return jsonify([
        {
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at  
        } for u in users
    ])


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")
    email = data.get("email")

    if not all([username, password, email]):
        return jsonify({"error": "Missing fields"}), 400

    if not User.validate_password(password):
        return jsonify({"error": "Weak password"}), 400

    if not User.validate_email(email):
        return jsonify({"error": "Invalid email"}), 400

    user = User(username, password, email)
    success = repo.register(user)

    if not success:
        return jsonify({"error": "Username already exists"}), 409

    return jsonify({"message": "User registered successfully"}), 201


@app.route("/users/<username>", methods=["DELETE"])
def delete_user(username):
    data = request.get_json()
    requester = data.get("requester")

    user = repo.get_user(requester)
    if not user or user.role != UserRole.ADMIN:
        return jsonify({"error": "Unauthorized operation"}), 403

    success = repo.delete_user(username)
    if success:
        return jsonify({"message": "User deleted"}), 200
    return jsonify({"error": "User not found"}), 404


@app.route("/users/<username>", methods=["PUT"])
def update_user(username):
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")
    requester=data.get("requester")

    user = repo.get_user(requester)
    if not user or user.role != UserRole.ADMIN:
        return jsonify({"error": "Unauthorized operation"}), 403

    success = repo.update_user(username, email=email, password=password)
    if success:
        return jsonify({"message": "User updated"}), 200
    return jsonify({"error": "User not found"}), 404


@app.route("/users", methods=["GET"])
def get_users():
    query = request.args.get("query", "").lower()
    result = [
        {
            "username": u.username,
            "email": u.email,
            "role": u.role,
            "created_at": u.created_at.isoformat()
        }
        for u in repo.get_all_users()
        if query in u.username.lower()
    ]
    return jsonify(result), 200


@app.route("/admin/users", methods=["POST"])
def get_users_admin():
    data = request.get_json()
    username = data.get("username")

    user = next((u for u in repo.users if u.username == username), None)
    if user and user.role == UserRole.ADMIN:
        return jsonify([
            {
                "username": u.username,
                "email": u.email,
                "role": u.role,
                "created_at": u.created_at.isoformat()
            } for u in repo.get_all_users()
        ]), 200
    return jsonify({"error": "Unauthorized"}), 403



@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = next((u for u in repo.users if u.username == username), None)
    if user and user.verify_password(password):
        return jsonify({
            "message": "Login successful",
            "username": user.username,
            "email": user.email,
            "role": user.role.value
        }), 200

    return jsonify({"error": "Invalid credentials"}), 401

if __name__ == "__main__":
    app.run(debug=True)

