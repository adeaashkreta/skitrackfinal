DROP DATABASE IF EXISTS skitrack;
CREATE DATABASE skitrack;
USE skitrack;

CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_roles_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_roles_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE user_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    role_id BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE (user_id, role_id),
    
    CONSTRAINT fk_user_roles_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_user_roles_role
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_user_roles_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_user_roles_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_permissions_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_permissions_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL,
    permission_id BIGINT UNSIGNED NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    UNIQUE (role_id, permission_id),
    
    CONSTRAINT fk_role_permissions_role
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_role_permissions_permission
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_role_permissions_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_role_permissions_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE refresh_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked_at DATETIME NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   
   CONSTRAINT fk_refresh_tokens_user
   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_refresh_tokens_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_refresh_tokens_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE audit_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    action VARCHAR(150) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id BIGINT UNSIGNED NULL,
    old_value JSON NULL,
    new_value JSON NULL,
    ip_address VARCHAR(45) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(100) NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_notifications_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_notifications_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE settings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    `key` VARCHAR(150) NOT NULL UNIQUE,
    `value` TEXT NULL,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_settings_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_settings_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE files (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    entity VARCHAR(100) NOT NULL,
    entity_id BIGINT UNSIGNED NULL,
    filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size BIGINT UNSIGNED NULL,
    uploaded_by BIGINT UNSIGNED NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_files_uploaded_by
    FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_files_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_files_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);




CREATE TABLE resorts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address VARCHAR(255) NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    description TEXT NULL,
    difficulty_level ENUM('beginner', 'intermediate', 'advanced', 'mixed') DEFAULT 'mixed',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_resorts_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_resorts_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE resort_managers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resort_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (resort_id, user_id),
    
    CONSTRAINT fk_resort_managers_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_resort_managers_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_resort_managers_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_resort_managers_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE facilities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_facilities_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_facilities_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE resort_facilities (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resort_id BIGINT UNSIGNED NOT NULL,
    facility_id BIGINT UNSIGNED NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE (resort_id, facility_id),
    
    CONSTRAINT fk_resort_facilities_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_resort_facilities_facility
    FOREIGN KEY (facility_id) REFERENCES facilities(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_resort_facilities_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_resort_facilities_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);


CREATE TABLE service_types (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_service_types_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_service_types_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE resort_services (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resort_id BIGINT UNSIGNED NOT NULL,
    service_type_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    duration VARCHAR(100) NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_resort_services_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_resort_services_service_type
    FOREIGN KEY (service_type_id) REFERENCES service_types(id) ON DELETE RESTRICT,
    
    CONSTRAINT fk_resort_services_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
   
   CONSTRAINT fk_resort_services_updated_by
   FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    resort_id BIGINT UNSIGNED NOT NULL,
    booking_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    number_of_people INT NOT NULL DEFAULT 1,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL DEFAULT 'pending',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_bookings_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_bookings_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_bookings_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE booking_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    resort_service_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_booking_itmes_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_booking_itmes_resort_srvice
    FOREIGN KEY (resort_service_id) REFERENCES resort_services(id) ON DELETE RESTRICT,
    
    CONSTRAINT fk_booking_items_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_booking_items_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE booking_status_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    booking_id BIGINT UNSIGNED NOT NULL,
    old_status ENUM('pending', 'confirmed', 'cancelled', 'completed') NULL,
    new_status ENUM('pending', 'confirmed', 'cancelled', 'completed') NOT NULL,
    changed_by BIGINT UNSIGNED NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT NULL,
    
    CONSTRAINT fk_booking_status_history_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_booking_status_history_changed_by
    FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
);


CREATE TABLE favorites (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    resort_id BIGINT UNSIGNED NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    UNIQUE (user_id, resort_id),

    CONSTRAINT fk_favorites_user_id
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,

    CONSTRAINT fk_favorites_resort_id
        FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,

    CONSTRAINT fk_favorites_created_by
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,

    CONSTRAINT fk_favorites_updated_by
        FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    resort_id BIGINT UNSIGNED NOT NULL,
    rating INT NOT NULL,
    comment TEXT NULL,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CHECK (rating >= 1 AND rating <= 5),
    
    CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_reviews_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT  fk_reviews_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_reviews_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);



CREATE TABLE condition_sources (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    source_type ENUM('api', 'dummy', 'manual_seed') NOT NULL DEFAULT 'dummy',
    base_url VARCHAR(500) NULL,
    description TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_condition_sources_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_condition_sources_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE resort_conditions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resort_id BIGINT UNSIGNED NOT NULL,
    source_id BIGINT UNSIGNED NOT NULL,
    temperature DECIMAL(5, 2) NULL,
    weather_status VARCHAR(100) NULL,
    snow_depth_cm DECIMAL(6, 2) NULL,
    slope_condition ENUM('excellent', 'good', 'moderate', 'poor', 'closed') DEFAULT 'moderate',
    visibility VARCHAR(100) NULL,
    wind_speed DECIMAL(6, 2) NULL,
    recorded_at DATETIME NOT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_resort_conditions_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_resort_conditions_source
    FOREIGN KEY (source_id) REFERENCES condition_sources(id) ON DELETE RESTRICT,
    
    CONSTRAINT fk_resort_conditions_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_resort_conditions_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE slopes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resort_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    difficulty ENUM('beginner', 'intermediate', 'advanced', 'expert') NOT NULL DEFAULT 'beginner',
    length_m INT NULL,
    status ENUM('open', 'closed', 'maintenance') NOT NULL DEFAULT 'open',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_slopes_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_slopes_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_slopes_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE lifts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resort_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    lift_type ENUM('gondola', 'chairlift', 'drag_lift', 'cable_car', 'other') NOT NULL DEFAULT 'other',
    status ENUM('open', 'closed', 'maintenance') NOT NULL DEFAULT 'open',
    capacity_per_hour INT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_lifts_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_lifts_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_lifts_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE resort_api_mappings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resort_id BIGINT UNSIGNED NOT NULL,
    source_id BIGINT UNSIGNED NOT NULL,
    external_location_id VARCHAR(150) NULL,
    external_resort_id VARCHAR(150) NULL,
    latitude DECIMAL(10, 7) NULL,
    longitude DECIMAL(10, 7) NULL,
    sync_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    last_sync_at DATETIME NULL,
    sync_status ENUM('active', 'failed', 'disabled', 'dummy') DEFAULT 'dummy',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_resort_api_mappings_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_resort_api_mappings_source
    FOREIGN KEY (source_id) REFERENCES condition_sources(id) ON DELETE RESTRICT,
    
    CONSTRAINT fk_resort_api_mappings_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_resorts_api_mappings_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);



CREATE TABLE reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    generated_by BIGINT UNSIGNED NULL,
    report_type VARCHAR(100) NOT NULL,
    filters JSON NULL,
    file_id BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_reports_generated_by
    FOREIGN KEY (generated_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_reports_file
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL
);

CREATE TABLE equipment_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_equipment_categories_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_equipment_categories_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE equipment (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    resort_id BIGINT UNSIGNED NOT NULL,
    category_id BIGINT UNSIGNED NOT NULL,
    name VARCHAR(150) NOT NULL,
    size VARCHAR(50) NULL,
    condition_status ENUM('new', 'good', 'used', 'damaged') NOT NULL DEFAULT 'good',
    total_quantity INT NOT NULL DEFAULT 0,
    available_quantity INT NOT NULL DEFAULT 0,
    price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_equipment_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_equipment_category
    FOREIGN KEY (category_id) REFERENCES equipment_categories(id) ON DELETE RESTRICT,
    
    CONSTRAINT fk_equipment_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_equipment_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE rental_bookings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    resort_id BIGINT UNSIGNED NOT NULL,
    rental_start_date DATE NOT NULL,
    rental_end_date DATE NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'confirmed', 'cancelled', 'active', 'returned') NOT NULL DEFAULT 'pending',
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_rental_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_rental_bookings_resort
    FOREIGN KEY (resort_id) REFERENCES resorts(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_rental_bookings_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_rental_bookings_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE rental_booking_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rental_booking_id BIGINT UNSIGNED NOT NULL,
    equipment_id BIGINT UNSIGNED NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_per_day DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    subtotal DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    created_by BIGINT UNSIGNED NULL,
    updated_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_rental_booking_items_rental
    FOREIGN KEY (rental_booking_id) REFERENCES rental_bookings(id) ON DELETE CASCADE,
    
    CONSTRAINT fk_rental_booking_items_equipment
    FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE RESTRICT,
    
    CONSTRAINT fk_rental_booking_created_by
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_rental_booking_updated_by
    FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
);


CREATE TABLE export_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NULL,
    entity VARCHAR(100) NOT NULL,
    format ENUM('CSV', 'EXCEL', 'JSON') NOT NULL,
    file_id BIGINT UNSIGNED NULL,
    status ENUM('pending', 'completed', 'failed') NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_export_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    
    CONSTRAINT fk_export_logs_file
    FOREIGN KEY (file_id) REFERENCES files(id) ON DELETE SET NULL
);



CREATE INDEX idx_users_email ON users(email);

CREATE INDEX idx_resorts_name ON resorts(name);
CREATE INDEX idx_resorts_city ON resorts(city);
CREATE INDEX idx_resorts_country ON resorts(country);

CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_resort_id ON bookings(resort_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

CREATE INDEX idx_reviews_resort_id ON reviews(resort_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);

CREATE INDEX idx_conditions_resort_id ON resort_conditions(resort_id);
CREATE INDEX idx_conditions_recorded_at ON resort_conditions(recorded_at);

CREATE INDEX idx_slopes_resort_id ON slopes(resort_id);
CREATE INDEX idx_lifts_resort_id ON lifts(resort_id);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity);

CREATE INDEX idx_equipment_resort_id ON equipment(resort_id);
CREATE INDEX idx_equipment_category_id ON equipment(category_id);
CREATE INDEX idx_equipment_available_quantity ON equipment(available_quantity);

CREATE INDEX idx_rental_bookings_user_id ON rental_bookings(user_id);
CREATE INDEX idx_rental_bookings_resort_id ON rental_bookings(resort_id);
CREATE INDEX idx_rental_bookings_status ON rental_bookings(status);
CREATE INDEX idx_rental_bookings_dates ON rental_bookings(rental_start_date, rental_end_date);

CREATE INDEX idx_rental_booking_items_booking_id ON rental_booking_items(rental_booking_id);
CREATE INDEX idx_rental_booking_items_equipment_id ON rental_booking_items(equipment_id);



INSERT INTO roles (name, description)
VALUES 
('Admin', 'Full access to the system'),
('Resort Manager', 'Manages assigned resort information and bookings'),
('User', 'Regular authenticated user')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT IGNORE INTO permissions (name, description)
VALUES
('user.manage', 'Manage users'),
('role.manage', 'Manage roles and permissions'),
('resort.view', 'View resorts'),
('resort.create', 'Create resorts'),
('resort.update', 'Update resorts'),
('resort.delete', 'Delete resorts'),
('booking.create', 'Create bookings'),
('booking.view_own', 'View own bookings'),
('booking.manage_resort', 'Manage bookings for assigned resort'),
('booking.manage_all', 'Manage all bookings'),
('review.create', 'Create reviews'),
('review.manage', 'Manage reviews'),
('conditions.view', 'View live conditions'),
('conditions.manage', 'Manage API mapping or dummy condition data'),
('report.view', 'View reports'),
('export.manage', 'Export/import data'),
('equipment.view', 'View rental equipment'),
('equipment.manage', 'Manage rental equipment'),
('rental.create', 'Create rental bookings'),
('rental.view_own', 'View own rental bookings'),
('rental.manage_resort', 'Manage rental bookings for assigned resort'),
('rental.manage_all', 'Manage all rental bookings')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO condition_sources (name, source_type, base_url, description)
VALUES
('Dummy Ski Conditions', 'dummy', NULL, 'Fallback dummy data for ski conditions'),
('Weather API', 'api', NULL, 'External weather API source, if available')
ON DUPLICATE KEY UPDATE name = VALUES(name);