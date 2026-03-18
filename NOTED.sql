CREATE DATABASE NOTED;

USE NOTED;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    bio VARCHAR(255),
    title VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE note_projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    FOREIGN KEY (user_id) REFERENCES users(id),
    project_name VARCHAR(50) NOT NULL
);

CREATE TABLE notes (
    id INT AUTO_INCREMENT NOT NULL PRIMARY KEY,
    project_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES note_projects(id),
    note_data LONGTEXT,
    title TINYTEXT
);

CREATE TABLE user_note_projects (
    user_id INT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id),
    project_id INT NOT NULL,
    FOREIGN KEY (project_id) REFERENCES note_projects(id)
)