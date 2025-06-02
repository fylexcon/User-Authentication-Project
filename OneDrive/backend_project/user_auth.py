import json
import os
import re
import hashlib
import secrets
from datetime import datetime, timedelta
from typing import Optional, Dict, List, Union
from enum import Enum

# ANSI color codes
class Colors:
    HEADER = '\033[95m'
    BLUE = '\033[94m'
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    ENDC = '\033[0m'
    BOLD = '\033[1m'
    UNDERLINE = '\033[4m'

def color_text(text: str, color: str) -> str:
    """Add color to text"""
    return f"{color}{text}{Colors.ENDC}"

class Config:
    """Configuration settings"""
    USER_FILE = "users.json"
    MIN_PASSWORD_LENGTH = 8
    TOKEN_EXPIRY_MINUTES = 30

class UserRole(str, Enum):
    """User roles enum"""
    ADMIN = "admin"
    USER = "user"

class ValidationError(Exception):
    """Custom exception for validation errors"""
    pass

class User:
    def __init__(self, username: str, password: str, email: str, role: Union[UserRole, str] = UserRole.USER):
        self.username = username
        self.password_hash = self._hash_password(password) if password else None
        self.email = email
        # Handle role as either UserRole enum or string
        self.role = role if isinstance(role, UserRole) else UserRole(role)
        self.created_at = datetime.now().isoformat()

    @staticmethod
    def _hash_password(password: str) -> str:
        """Hash password using SHA-256 with salt"""
        salt = secrets.token_hex(16)
        return f"{salt}:{hashlib.sha256((password + salt).encode()).hexdigest()}"

    def verify_password(self, password: str) -> bool:
        """Verify password against stored hash"""
        salt = self.password_hash.split(':')[0]
        return self.password_hash.split(':')[1] == hashlib.sha256((password + salt).encode()).hexdigest()

    def to_dict(self) -> Dict:
        return {
            "username": self.username,
            "password_hash": self.password_hash,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at
        }
    
    @staticmethod
    def from_dict(data):
        return User(
            username=data["username"],
            password=data["password_hash"],
            email=data["email"],
            role=UserRole(data["role"]),
            created_at=datetime.fromisoformat(data["created_at"])  # burada geri dönüşüm
        )


    @staticmethod
    def validate_password(password: str) -> bool:
        """Validate password complexity"""
        if len(password) < Config.MIN_PASSWORD_LENGTH:
            return False
        if not re.search(r"[A-Z]", password):
            return False
        if not re.search(r"[a-z]", password):
            return False
        if not re.search(r"\d", password):
            return False
        return True

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format"""
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        return bool(re.match(email_pattern, email))

class UserRepository:
    def __init__(self):
        self.users: List[User] = []
        self.active_sessions: Dict[str, Dict] = {}
        self.migrate_legacy_users()
        self.loadUsers()

    def get_all_users(self):
        return self.users
    
    def migrate_legacy_users(self):
        """Migrate existing users to the new secure format"""
        try:
            print("Starting user data migration...")
            backup_file = Config.USER_FILE + '.backup'
            
            # If users.json is empty but backup exists, restore from backup
            if (not os.path.exists(Config.USER_FILE) or os.path.getsize(Config.USER_FILE) == 0) and os.path.exists(backup_file):
                print("Found backup file with user data, will migrate from backup")
                source_file = backup_file
            else:
                source_file = Config.USER_FILE
                
            if not os.path.exists(source_file):
                print("No users file found to migrate.")
                return
            
            # Read existing users
            with open(source_file, 'r', encoding='utf-8') as file:
                content = file.read().strip()
                if not content:
                    print("No users to migrate.")
                    return
                legacy_users = json.loads(content)
            
            # Check if migration is needed
            if any("password_hash" in user for user in legacy_users):
                print("Users are already in new format.")
                return
                
            print("Found legacy users, starting migration...")
            
            # Convert each user to new format
            migrated_users = []
            for user_data in legacy_users:
                try:
                    # Create new user with secure format
                    user = User(
                        username=user_data["username"],
                        password=user_data["password"],  # Will be hashed in User.__init__
                        email=user_data["email"],
                        role=UserRole(user_data.get("role", UserRole.USER.value))  # Preserve role
                    )
                    migrated_users.append(user.to_dict())
                    print(f"Migrated user: {user.username} ({user.role.value})")
                except Exception as e:
                    print(f"Error migrating user {user_data.get('username')}: {str(e)}")
            
            if not migrated_users:
                print("No users were successfully migrated.")
                return
                
            # Create backup if it doesn't exist
            if source_file == Config.USER_FILE and not os.path.exists(backup_file):
                os.rename(Config.USER_FILE, backup_file)
                print(f"Original file backed up to: {backup_file}")
            
            # Save migrated users
            with open(Config.USER_FILE, 'w', encoding='utf-8') as file:
                json.dump(migrated_users, file, indent=4)
            print("Migration completed successfully!")
            
            # Verify the file was written correctly
            if os.path.exists(Config.USER_FILE):
                with open(Config.USER_FILE, 'r', encoding='utf-8') as file:
                    content = file.read().strip()
                    if not content:
                        raise Exception("Migration failed: New file is empty")
            else:
                raise Exception("Migration failed: New file was not created")
                
        except Exception as e:
            print(f"Migration failed: {str(e)}")
            # Restore from backup if main file is empty or doesn't exist
            if (not os.path.exists(Config.USER_FILE) or os.path.getsize(Config.USER_FILE) == 0) and os.path.exists(backup_file):
                print("Restoring from backup file...")
                with open(backup_file, 'r', encoding='utf-8') as backup:
                    with open(Config.USER_FILE, 'w', encoding='utf-8') as main:
                        main.write(backup.read())
                print("Restored from backup file.")

    def loadUsers(self):
        try:
            print(f"Attempting to load users from {Config.USER_FILE}")
            
            if not os.path.exists(Config.USER_FILE):
                print(f"File {Config.USER_FILE} does not exist, creating new file")
                with open(Config.USER_FILE, "w", encoding="utf-8") as file:
                    json.dump([], file)
                # Create default admin user
                self.register(User("admin", "Admin123!", "admin@example.com", UserRole.ADMIN))
                return

            with open(Config.USER_FILE, "r", encoding="utf-8") as file:
                content = file.read().strip()
                print(f"Raw file contents: {content}")
                
                if not content:
                    print("File is empty, initializing with empty user list")
                    return
                    
                users = json.loads(content)
                print(f"Loaded {len(users)} users from file")
                
                for user_data in users:
                    try:
                        if "password_hash" in user_data:
                            # New format
                            user = User(
                                username=user_data["username"],
                                password="",  # Password hash is loaded directly
                                email=user_data["email"],
                                role=user_data.get("role", UserRole.USER)
                            )
                            user.password_hash = user_data["password_hash"]
                            user.created_at = user_data.get("created_at", datetime.now().isoformat())
                        else:
                            # Old format - should not happen after migration
                            user = User(
                                username=user_data["username"],
                                password=user_data["password"],
                                email=user_data["email"],
                                role=UserRole.USER
                            )
                        self.users.append(user)
                        print(f"Loaded user: {user.username}")
                    except Exception as e:
                        print(f"Error loading user data: {str(e)}")
                        print(f"Problematic user data: {user_data}")
                        
        except Exception as e:
            print(f"Error loading users: {str(e)}")
            raise

    def savetoFile(self):
        try:
            data = [user.to_dict() for user in self.users]
            print(f"Saving {len(data)} users to {Config.USER_FILE}")
            print(f"Data to be saved: {json.dumps(data, indent=2)}")
            
            with open(Config.USER_FILE, "w", encoding="utf-8") as file:
                json.dump(data, file, indent=4)
            
            # Verify the file was written
            if os.path.exists(Config.USER_FILE):
                with open(Config.USER_FILE, "r", encoding="utf-8") as file:
                    saved_content = file.read()
                print(f"File contents after save: {saved_content}")
            else:
                print(f"Warning: File {Config.USER_FILE} does not exist after save attempt")
                
        except Exception as e:
            print(f"Error saving to file: {str(e)}")
            raise

    def register(self, user: User) -> bool:
        try:
            if any(u.username == user.username for u in self.users):
                raise ValidationError("Username already exists")
            
            if not User.validate_email(user.email):
                raise ValidationError("Invalid email format")
            
            self.users.append(user)
            self.savetoFile()
            print("User created successfully")
            return True
        except ValidationError as e:
            print(f"Registration failed: {str(e)}")
            return False

    def login(self) -> Optional[str]:
        username = input("Username: ")
        password = input("Password: ")

        user = next((u for u in self.users if u.username == username), None)
        if user and user.verify_password(password):
            token = secrets.token_hex(32)
            self.active_sessions[token] = {
                "username": username,
                "expires": datetime.now() + timedelta(minutes=Config.TOKEN_EXPIRY_MINUTES)
            }
            print(f"Welcome, {username}!")
            return token
        print("Invalid credentials")
        return None

    def logout(self, token: str):
        if token in self.active_sessions:
            username = self.active_sessions[token]["username"]
            del self.active_sessions[token]
            print(f"Goodbye, {username}")
        else:
            print("No valid session found")

    def get_user(self, username):
        return next((u for u in self.users if u.username == username), None)
    
    def get_current_user(self, token: str) -> Optional[User]:
        if token not in self.active_sessions:
            return None
        
        session = self.active_sessions[token]
        if datetime.now() > session["expires"]:
            del self.active_sessions[token]
            return None
            
        return next((u for u in self.users if u.username == session["username"]), None)
    



    def list_users(self, token: str):
        """Admin function to list all users"""
        if not self.is_admin(token):
            print(color_text("Access denied: Admin privileges required", Colors.RED))
            return
            
        print(f"\n{color_text('User List:', Colors.HEADER)}")
        header = color_text("=" * 75, Colors.BLUE)
        print(header)
        
        # Column headers
        headers = [
            color_text("Username", Colors.BOLD),
            color_text("Email", Colors.BOLD),
            color_text("Role", Colors.BOLD),
            color_text("Created", Colors.BOLD)
        ]
        print(f"{headers[0]:<20} {headers[1]:<30} {headers[2]:<10} {headers[3]:<15}")
        print(color_text("-" * 75, Colors.BLUE))
        
        # User rows
        for user in self.users:
            created_date = user.created_at.split('T')[0]
            role_color = Colors.GREEN if user.role == UserRole.ADMIN else Colors.BLUE
            username = color_text(user.username, role_color)
            # Get role value safely, handling both Enum and string cases
            role_value = user.role.value if hasattr(user.role, 'value') else user.role
            role = color_text(role_value, role_color)
            print(f"{username:<20} {user.email:<30} {role:<10} {created_date:<15}")
            
        print(header)
        total = color_text(str(len(self.users)), Colors.GREEN)
        print(f"Total users: {total}")

    def change_user_role(self, token: str):
        """Admin function to change user roles"""
        if not self.is_admin(token):
            print(color_text("Access denied: Admin privileges required", Colors.RED))
            return
            
        username = input(color_text("Enter username to modify: ", Colors.YELLOW))
        user = next((u for u in self.users if u.username == username), None)
        
        if not user:
            print(color_text("User not found", Colors.RED))
            return
            
        current_role = color_text(user.role.value, Colors.GREEN)
        print(f"Current role: {current_role}")
        new_role = input(color_text("Enter new role (admin/user): ", Colors.YELLOW)).lower()
        
        if new_role not in [UserRole.ADMIN.value, UserRole.USER.value]:
            print(color_text("Invalid role", Colors.RED))
            return
            
        user.role = UserRole(new_role)
        self.savetoFile()
        print(color_text(f"Role updated for user {username}", Colors.GREEN))

    def delete_user(self, username):
        for i, user in enumerate(self.users):
            if user.username == username:
                del self.users[i]
                self.save()
                return True
        return False

    def update_user(self, username, email=None, password=None):
        for user in self.users:
            if user.username == username:
                if email:
                    user.email = email
                if password:
                    user.password_hash = user.hash_password(password)
                self.save()
                return True
        return False



    def is_admin(self, token: str) -> bool:
        """Check if the current user is an admin"""
        if token not in self.active_sessions:
            return False
            
        session = self.active_sessions[token]
        if datetime.now() > session["expires"]:
            del self.active_sessions[token]
            return False
            
        user = next((u for u in self.users if u.username == session["username"]), None)
        return user is not None and user.role == UserRole.ADMIN

def display_menu(is_admin=False, is_logged_in=False):
    """Display the menu options"""
    # Header
    menu_header = color_text('Menu', Colors.HEADER)
    print(f"\n{menu_header.center(75, '*')}")
    
    # Main Menu
    print(f"\n{color_text('Main Menu:', Colors.BOLD)}")
    options = [
        ("1", "Register", "Create a new user account"),
        ("2", "Login", "Log into your account"),
        ("3", "Logout", "Log out of your account"),
        ("4", "View Profile", "View your account details"),
        ("5", "Change Password", "Change your account password"),
        ("6", "Exit", "Exit the application")
    ]
    
    for num, title, desc in options:
        print(f"{color_text(num, Colors.YELLOW)}- {color_text(title, Colors.BLUE)} {color_text('→', Colors.BOLD)} {desc}")
    
    # Admin Menu
    if is_admin:
        print(f"\n{color_text('Admin Menu:', Colors.BOLD)}")
        admin_options = [
            ("7", "List All Users", "View all user accounts"),
            ("8", "Change User Role", "Modify user permissions")
        ]
        for num, title, desc in admin_options:
            print(f"{color_text(num, Colors.YELLOW)}- {color_text(title, Colors.GREEN)} {color_text('→', Colors.BOLD)} {desc}")
        
        print(f"\n{color_text('Logged in as ADMIN', Colors.GREEN + Colors.BOLD)}")
    elif is_logged_in:
        print(f"\n{color_text('Currently logged in as USER', Colors.BLUE + Colors.BOLD)}")

def main():
    repository = UserRepository()
    current_token = None

    while True:
        try:
            # Get current user status
            current_user = repository.get_current_user(current_token) if current_token else None
            is_admin = current_user and current_user.role == UserRole.ADMIN
            
            # Display menu
            display_menu(is_admin=is_admin, is_logged_in=bool(current_user))
            
            selection = input(f"\n{color_text('Selection: ', Colors.YELLOW)}").strip()
            
            if selection == '6':
                print(f"\n{color_text('Goodbye!', Colors.GREEN)}")
                break
                
            elif selection == '1':
                print(f"\n{color_text('User Registration', Colors.HEADER)}")
                print(color_text("=" * 40, Colors.BLUE))
                username = input(color_text("Enter username: ", Colors.YELLOW))
                while True:
                    password = input(color_text("Enter password: ", Colors.YELLOW))
                    if User.validate_password(password):
                        break
                    print(color_text(
                        f"Password must be at least {Config.MIN_PASSWORD_LENGTH} characters long "
                        "and contain uppercase, lowercase, and numbers", 
                        Colors.RED
                    ))
                email = input(color_text("Enter email: ", Colors.YELLOW))
                user = User(username=username, password=password, email=email)
                repository.register(user)
                
            elif selection == '2':
                if current_user:
                    print(color_text("Already logged in. Please logout first.", Colors.YELLOW))
                else:
                    print(f"\n{color_text('Login', Colors.HEADER)}")
                    print(color_text("=" * 40, Colors.BLUE))
                    current_token = repository.login()
                
            elif selection == '3':
                if current_token:
                    repository.logout(current_token)
                    current_token = None
                else:
                    print(color_text("Not logged in", Colors.YELLOW))
                    
            elif selection == '4':
                if current_user:
                    print(f"\n{color_text('User Profile:', Colors.HEADER)}")
                    print(color_text("=" * 40, Colors.BLUE))
                    print(f"{color_text('Username:', Colors.BOLD)} {current_user.username}")
                    print(f"{color_text('Email:', Colors.BOLD)} {current_user.email}")
                    role_color = Colors.GREEN if current_user.role == UserRole.ADMIN else Colors.BLUE
                    print(f"{color_text('Role:', Colors.BOLD)} {color_text(current_user.role.value, role_color)}")
                    print(f"{color_text('Created:', Colors.BOLD)} {current_user.created_at}")
                    print(color_text("=" * 40, Colors.BLUE))
                else:
                    print(color_text("Not logged in", Colors.YELLOW))
                    
            elif selection == '5':
                if current_user:
                    print(f"\n{color_text('Change Password', Colors.HEADER)}")
                    print(color_text("=" * 40, Colors.BLUE))
                    old_password = input(color_text("Enter current password: ", Colors.YELLOW))
                    new_password = input(color_text("Enter new password: ", Colors.YELLOW))
                    if not User.validate_password(new_password):
                        print(color_text(
                            f"New password must be at least {Config.MIN_PASSWORD_LENGTH} characters long "
                            "and contain uppercase, lowercase, and numbers",
                            Colors.RED
                        ))
                    else:
                        if current_user.verify_password(old_password):
                            current_user.password_hash = current_user._hash_password(new_password)
                            repository.savetoFile()
                            print(color_text("Password changed successfully", Colors.GREEN))
                        else:
                            print(color_text("Current password is incorrect", Colors.RED))
                else:
                    print(color_text("Not logged in", Colors.YELLOW))
                    
            elif selection == '7':
                if is_admin:
                    repository.list_users(current_token)
                else:
                    print(color_text("Invalid selection or insufficient privileges", Colors.RED))
                
            elif selection == '8':
                if is_admin:
                    repository.change_user_role(current_token)
                else:
                    print(color_text("Invalid selection or insufficient privileges", Colors.RED))
                
            else:
                print(color_text("Invalid selection", Colors.RED))
                
        except Exception as e:
            print(color_text(f"Error: {str(e)}", Colors.RED))

if __name__ == "__main__":
    main()

