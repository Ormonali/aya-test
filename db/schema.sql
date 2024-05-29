CREATE TABLE IF NOT EXISTS Department (
    id INT PRIMARY KEY,
    name VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS Employee (
    id INT PRIMARY KEY,
    name VARCHAR(100),
    surname VARCHAR(100),
    department_id INT,
    FOREIGN KEY (department_id) REFERENCES Department(id)
);

CREATE TABLE IF NOT EXISTS Statement (
    id INT PRIMARY KEY,
    employee_id INT,
    amount DECIMAL(10, 2),
    date DATE,
    FOREIGN KEY (employee_id) REFERENCES Employee(id)
);

CREATE TABLE IF NOT EXISTS Donation (
    id INT PRIMARY KEY,
    employee_id INT,
    amount DECIMAL(10, 2),
    currency VARCHAR(3),
    date DATE,
    FOREIGN KEY (employee_id) REFERENCES Employee(id)
);
