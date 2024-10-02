-- Create the database
CREATE DATABASE IF NOT EXISTS blog_diary;
USE blog_diary;

-- Create Users table
CREATE TABLE Users (
    u_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ip_addr VARCHAR(45)
);

-- Create UserSettings table
CREATE TABLE UserSettings (
    u_id INT PRIMARY KEY,
    theme ENUM('light', 'dark', 'system') DEFAULT 'system',
    email_notifications BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'en',
    FOREIGN KEY (u_id) REFERENCES Users(u_id) ON DELETE CASCADE
);

-- Create Posts table
CREATE TABLE Posts (
    p_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    visibility ENUM('public', 'private', 'friends') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES Users(u_id) ON DELETE CASCADE
);

-- Create PostRevisions table
CREATE TABLE PostRevisions (
    r_id INT AUTO_INCREMENT PRIMARY KEY,
    p_id INT NOT NULL,
    content TEXT,
    revised_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (p_id) REFERENCES Posts(p_id) ON DELETE CASCADE
);

-- Create Images table
CREATE TABLE Images (
    i_id INT AUTO_INCREMENT PRIMARY KEY,
    u_id INT NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    visibility ENUM('public', 'private', 'friends') DEFAULT 'private',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (u_id) REFERENCES Users(u_id) ON DELETE CASCADE
);

-- Create PostImages table (for many-to-many relationship between Posts and Images)
CREATE TABLE PostImages (
    p_id INT,
    i_id INT,
    PRIMARY KEY (p_id, i_id),
    FOREIGN KEY (p_id) REFERENCES Posts(p_id) ON DELETE CASCADE,
    FOREIGN KEY (i_id) REFERENCES Images(i_id) ON DELETE CASCADE
);

-- Create Comments table
CREATE TABLE Comments (
    c_id INT AUTO_INCREMENT PRIMARY KEY,
    p_id INT NOT NULL,
    u_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (p_id) REFERENCES Posts(p_id) ON DELETE CASCADE,
    FOREIGN KEY (u_id) REFERENCES Users(u_id) ON DELETE CASCADE
);

-- Create Tags table
CREATE TABLE Tags (
    t_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

-- Create PostTags table
CREATE TABLE PostTags (
    p_id INT,
    t_id INT,
    PRIMARY KEY (p_id, t_id),
    FOREIGN KEY (p_id) REFERENCES Posts(p_id) ON DELETE CASCADE,
    FOREIGN KEY (t_id) REFERENCES Tags(t_id) ON DELETE CASCADE
);

-- Create Friends table
CREATE TABLE Friends (
    u_id INT,
    friend_id INT,
    status ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (u_id, friend_id),
    FOREIGN KEY (u_id) REFERENCES Users(u_id) ON DELETE CASCADE,
    FOREIGN KEY (friend_id) REFERENCES Users(u_id) ON DELETE CASCADE
);

-- Add indexes
CREATE INDEX idx_posts_user ON Posts(u_id);
CREATE INDEX idx_posts_created ON Posts(created_at);
CREATE INDEX idx_comments_post ON Comments(p_id);
CREATE INDEX idx_comments_user ON Comments(u_id);
CREATE INDEX idx_images_user ON Images(u_id);
CREATE INDEX idx_friends_status ON Friends(status);