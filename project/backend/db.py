from flask import Flask, request, jsonify
from flask_bcrypt import Bcrypt
from flask_cors import CORS
import jwt
import datetime
from pymongo import MongoClient
import certifi

app = Flask(__name__)
bcrypt = Bcrypt(app)
CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})

app.config["SECRET_KEY"] = "myverysecuresecretkey"

# MongoDB connection with TLS CA file to avoid SSL errors
client = MongoClient(
    "mongodb+srv://somu17721:Somu8499@cluster0.dwfbi1r.mongodb.net/?retryWrites=true&w=majority",
    tlsCAFile=certifi.where()
)
db = client["authDB"]
users = db["users"]

print("Databases:", client.list_database_names())

# Signup route
@app.route("/api/signup", methods=["POST", "OPTIONS"])
def signup():
    if request.method == "OPTIONS":
        return '', 200  # Preflight request

    data = request.get_json()
    print("Signup data:", data)

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required"}), 400

    if users.find_one({"email": email}):
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")
    users.insert_one({
        "name": name,
        "email": email,
        "password": hashed_password
    })

    return jsonify({"message": "User created successfully"}), 201

# Login route
@app.route("/api/login", methods=["POST", "OPTIONS"])
def login():
    if request.method == "OPTIONS":
        return '', 200

    data = request.get_json()
    print("Login data:", data)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"message": "Email and password are required"}), 400

    user = users.find_one({"email": email})
    if not user:
        return jsonify({"message": "User not found"}), 404

    if not bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Invalid credentials"}), 401

    token = jwt.encode(
        {
            "id": str(user["_id"]),
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=1)
        },
        app.config["SECRET_KEY"],
        algorithm="HS256"
    )

    return jsonify({"message": "Login successful", "token": token}), 200

if __name__ == "__main__":
    app.run(port=7000, debug=True)
