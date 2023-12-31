let inquirer = require('inquirer');
const mysql = require('mysql2');
const { table } = require('table');

const db = mysql.createConnection(
    {
        host: 'localhost',

        user: 'root',

        password: '1234',
        database: 'employee_tracker'
    },
    console.log(`Connected to the employee_tracker database.`)
);

db.query("SELECT * FROM departments", (error, response) => {
    dynamicDepartmentList = response.map(item => item.name);
  
});

db.query("SELECT * FROM role", (error, response) => {

    dynamicRoleList = response.map(item => item.title);
    
});

db.query("SELECT * FROM employee", (error, response) => {
    employeeNames = response.map(item => item.first_name + " " + item.last_name);

});




displayPrompt();  // Starts the terminal prompt.
function displayPrompt() {
    inquirer.prompt([
      {
        type: 'list',
        name: 'index',
        message: 'What would you like to do?',
        choices: ['View All Employees', 'Add Employee', 'Update Employee Role', 'View All Roles', 'Add Role', 'View All Departments', 'Add Department', 'Quit']
      }
    ]).then((answers) => {
      /*---------------- If user selected 'View All Employees' the code below will run.----------------*/
      if (answers.index === 'View All Employees') {
        db.query("SELECT employee.first_name, employee.last_name, role.title, departments.name AS department, role.salary FROM employee INNER JOIN role ON employee.role_id=role.id INNER JOIN departments ON role.department_id=departments.id;", function (err, res) {
          if (err) throw err;
  
          // Remove the index column from the results
          const tableData = res.map(({ index, ...rest }) => Object.values(rest));
  
          // Create a new table array
          const data = [];
  
          // Add headers to the table
          const headers = Object.keys(res[0]).filter(key => key !== 'index');
          data.push(headers);
  
          // Add rows to the table
          tableData.forEach(row => data.push(row));
  
          // Display the table
          const output = table(data);
          console.log(output);
          displayPrompt();
        });
      }
      if (answers.index === 'Add Employee') {
        db.query("SELECT id, title FROM role", (error, results) => {
          if (error) {
            console.error(error);
            return;
          }
          const newRolesArray = results.map(({ id, title }) => ({
            name: title,
            value: id,
          }));
          inquirer.prompt([
            {
              type: 'input',
              name: 'newFirstName',
              message: 'What is the first name of the new employee?'
            },
            {
              type: 'input',
              name: 'newLastName',
              message: 'What is the last name of the new employee?'
            },
            {
              type: 'list',
              name: 'roleNameInput',
              message: 'Which role would you like to assign to this employee?',
              choices: newRolesArray
            }
  
          ]).then((answers) => {
            db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUE ("${answers.newFirstName}", "${answers.newLastName}", ${answers.roleNameInput}, null )`)
                displayPrompt();
          })
        })
      }
  
      /*---------------- If user selected 'Update Employee Role' the code below will run.----------------*/
      if (answers.index === 'Update Employee Role') {
        db.query("SELECT id, name FROM departments", (error, results) => {
  
          newDepartmentArray01 = results.map(({ id, name }) => ({
            name: name,
            value: id,
          }));
          db.query("SELECT id, first_name, last_name FROM employee", (error, results) => {
            newEmployeeArray01 = results.map(({ id, first_name, last_name }) => ({
              name: `${first_name} ${last_name}`,
              value: id
            }));
            inquirer.prompt([
              {
                type: 'list',
                name: 'employeeChoice',
                message: "Which employee's role would you like to update?",
                choices: newEmployeeArray01

              },
              {
                type: 'list',
                name: 'roleNameInput',
                message: 'Which role would you like to assign to this employee?',
                choices: newDepartmentArray01
              }
            ]).then((answer) => {
              db.query(`UPDATE employee SET role_id = ${answer.roleNameInput} WHERE id = ${answer.employeeChoice};`)
              displayPrompt();
            });
          })
        })  // create a statement to update employee role.
      } else if (answers.index === 'View All Roles') {
        db.query("SELECT role.id, role.title, departments.name, role.salary FROM role INNER JOIN departments ON  departments.id = role.department_id;", (err, response) => {
          console.table(response);
          displayPrompt(); // Starts the terminal prompt.
  
        });
        // create a statement to view all roles.
      } else if (answers.index === 'Add Role') {
        db.query("SELECT id, name FROM departments", (error, results) => {
          newDepartmentArray02 = results.map(({ id, name }) => ({
            name: name,
            value: id,
          }));
          inquirer.prompt([
            {
              type: 'input',
              name: 'roleNameInput',
              message: 'What is the name of the role?'
            },
            {
              type: 'input',
              name: 'salaryInput',
              message: 'What is the salary of the role?'
            },
            {
              type: 'list',
              name: 'departmentInput',
              message: 'Which department does the role belong to?',
              choices: newDepartmentArray02
            }
          ]).then((answer) => {
            db.query(`INSERT INTO role (title, department_id, salary) VALUES ("${answer.roleNameInput}", ${answer.departmentInput}, ${answer.salaryInput});`,
              function (err, result) {
                if (err) throw err;
                console.log('Added new role successfully');
                displayPrompt(); // Starts the terminal prompt.
              }
            );
          })
        });
      }
  
      /*---------------- If user selected 'Update Employee Role' the code below will run. ----------------*/
      else if (answers.index === 'View All Departments') {
        db.query(`SELECT * FROM departments;`, (err, res) => {
          console.table(res);
          displayPrompt(); // Starts the terminal prompt.
        });
      }
  
  
      /*---------------- If user selected 'Add Department' the code below will run. ----------------*/
      else if (answers.index === 'Add Department') {
  
        inquirer.prompt([
          {
            type: 'input',
            name: 'depNameInput',
            message: 'What is the name of the department?'
          }
        ]).then((answers) => {
          db.query(`INSERT INTO departments (name) VALUES ("${answers.depNameInput}")`, (err, res) => {
            if (err) throw err;
            console.log(`Added ${answers.depNameInput} to the database`);
            displayPrompt(); // Starts the terminal prompt.
          })
        });
      } else if (answers.index === 'Quit') {
        console.log('Please run "node server.js" inside the terminal in order to start over');

      }
    });
  }