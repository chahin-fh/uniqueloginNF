<?php
// Database configuration
$servername = "localhost";
$db_username = "root";
$db_password = "";
$database = "login_system";

// Create connection
$conn = new mysqli($servername, $db_username, $db_password, $database);

// Check connection
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// Convert old password formats to 'l' (long) and 's' (short)
$query = "SELECT id, password FROM users";
$result = $conn->query($query);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $old_password = $row['password'];
        $new_password = $old_password;

        // First, convert any triple-spaces (legacy long tab) to 'l'
        $new_password = str_replace('   ', 'l', $new_password);
        // Convert previous 'a' marker (if present) to 'l'
        $new_password = str_replace('a', 'l', $new_password);
        // Finally, convert any remaining single spaces (short tabs) to 's'
        $new_password = str_replace(' ', 's', $new_password);

        if ($old_password !== $new_password) {
            $update_query = $conn->prepare("UPDATE users SET password = ? WHERE id = ?");
            $update_query->bind_param("si", $new_password, $row['id']);
            $update_query->execute();
            echo "Updated user ID " . $row['id'] . ": " . htmlspecialchars($old_password) . " → " . htmlspecialchars($new_password) . "<br>";
            $update_query->close();
        }
    }
    echo "<br><strong>Migration completed!</strong>";
} else {
    echo "No users found in database.";
}

$conn->close();
?>
