<?php
header('Content-Type: application/json');

// Database connection
$host = 'localhost';
$dbname = 'krenkimchou_books';
$username = 'your_db_username';
$password = 'your_db_password';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Database connection failed']);
    exit;
}

// Check if user is logged in (you'll need to implement your own session/auth system)
session_start();
if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Authentication required']);
    exit;
}

// File upload directory
$uploadDir = __DIR__ . '/uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

// Process form data
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $title = $_POST['bookTitle'] ?? '';
    $author = $_POST['bookAuthor'] ?? '';
    $coverFile = $_FILES['bookCover'] ?? null;
    $pdfFile = $_FILES['bookPdf'] ?? null;

    // Validate inputs
    if (empty($title) || empty($author) || !$pdfFile) {
        echo json_encode(['success' => false, 'message' => 'Required fields are missing']);
        exit;
    }

    // Handle PDF upload
    $pdfExt = strtolower(pathinfo($pdfFile['name'], PATHINFO_EXTENSION));
    if ($pdfExt !== 'pdf') {
        echo json_encode(['success' => false, 'message' => 'Only PDF files are allowed']);
        exit;
    }

    $pdfFileName = uniqid('book_', true) . '.pdf';
    $pdfPath = $uploadDir . $pdfFileName;
    
    if (!move_uploaded_file($pdfFile['tmp_name'], $pdfPath)) {
        echo json_encode(['success' => false, 'message' => 'Failed to upload PDF']);
        exit;
    }

    // Handle cover image upload (optional)
    $coverPath = null;
    if ($coverFile && $coverFile['error'] === UPLOAD_ERR_OK) {
        $allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
        $fileType = mime_content_type($coverFile['tmp_name']);
        
        if (in_array($fileType, $allowedImageTypes)) {
            $coverExt = strtolower(pathinfo($coverFile['name'], PATHINFO_EXTENSION));
            $coverFileName = uniqid('cover_', true) . '.' . $coverExt;
            $coverPath = $uploadDir . $coverFileName;
            
            if (!move_uploaded_file($coverFile['tmp_name'], $coverPath)) {
                // If cover upload fails, continue without it
                $coverPath = null;
            }
        }
    }

    // Insert book into database
    try {
        $stmt = $pdo->prepare("INSERT INTO books (title, author, cover_image_path, pdf_path, uploader_id) 
                              VALUES (:title, :author, :cover_path, :pdf_path, :uploader_id)");
        
        $stmt->execute([
            ':title' => $title,
            ':author' => $author,
            ':cover_path' => $coverPath,
            ':pdf_path' => $pdfPath,
            ':uploader_id' => $_SESSION['user_id']
        ]);
        
        echo json_encode(['success' => true, 'message' => 'Book uploaded successfully']);
    } catch (PDOException $e) {
        // Clean up uploaded files if database insert fails
        if (file_exists($pdfPath)) unlink($pdfPath);
        if ($coverPath && file_exists($coverPath)) unlink($coverPath);
        
        echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
}
?>