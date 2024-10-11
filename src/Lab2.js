// Assuming randomUserMock and additionalUsers are imported from a separate file
import { randomUserMock, additionalUsers } from './FE4U-Lab2-mock.js';

// Task 1: Transform data and merge arrays
function transformAndMergeUsers(randomUsers, additionalUsers) {
  const courseList = [
    'Mathematics', 'Physics', 'English', 'Computer Science', 'Dancing',
    'Chess', 'Biology', 'Chemistry', 'Law', 'Art', 'Medicine', 'Statistics'
  ];

  // Helper function to generate a random course
  function getRandomCourse() {
    return courseList[Math.floor(Math.random() * courseList.length)];
  }

  // Helper function to generate a unique ID
  function generateUniqueId() {
    return '_' + Math.random().toString(36).substr(2, 9);
  }

  // Map over randomUsers to ensure they have the required fields
  const transformedRandomUsers = randomUsers.map(user => {
    // Extract full_name from name object
    const fullName = user.name ? `${user.name.first} ${user.name.last}` : '';

    return {
      ...user,
      id: user.id && user.id.value ? user.id.value : generateUniqueId(),
      favorite: false,
      course: getRandomCourse(),
      bg_color: null,
      note: null,
      full_name: fullName,
      b_day: user.dob ? user.dob.date : null,
      age: user.dob ? user.dob.age : null,
      picture_large: user.picture ? user.picture.large : null,
      picture_thumbnail: user.picture ? user.picture.thumbnail : null,
    };
  });

  // Ensure additionalUsers have all the required fields
  const transformedAdditionalUsers = additionalUsers.map(user => ({
    ...user,
    id: user.id ? user.id : generateUniqueId(),
    favorite: user.favorite !== undefined ? user.favorite : false,
    course: user.course ? user.course : getRandomCourse(),
    bg_color: user.bg_color ? user.bg_color : null,
    note: user.note ? user.note : null,
  }));

  // Merge the two arrays
  const allUsers = [...transformedRandomUsers, ...transformedAdditionalUsers];

  // Remove duplicates based on email
  const uniqueUsers = [];
  const emails = new Set();

  allUsers.forEach(user => {
    if (!emails.has(user.email)) {
      emails.add(user.email);
      uniqueUsers.push(user);
    }
  });


  return uniqueUsers;
}

// Task 2: Validate an object
function validateUser(user) {
  const errors = [];

  // Check if fields are strings and start with a capital letter
  ['full_name', 'gender', 'note', 'state', 'city', 'country'].forEach(field => {
    if (user[field]) {
      if (typeof user[field] !== 'string') {
        errors.push(`${field} must be a string.`);
      } else if (user[field][0] !== user[field][0].toUpperCase()) {
        errors.push(`${field} must start with a capital letter.`);
      }
    }
  });

  // Check if age is numeric
  if (user.age && typeof user.age !== 'number') {
    errors.push('age must be numeric.');
  }

  // Validate phone number format (simple regex for example purposes)
  const phoneRegex = /^\+?[0-9\s\-()]+$/;
  if (user.phone && !phoneRegex.test(user.phone)) {
    errors.push('phone number format is invalid.');
  }

  // Validate email format
  if (user.email && !user.email.includes('@')) {
    errors.push('email format is invalid.');
  }

  return errors.length === 0 ? true : errors;
}

// Task 3: Filter users by parameters
function filterUsers(users, filters) {
  return users.filter(user => {
    for (const key in filters) {
      if (user[key] === undefined || user[key] !== filters[key]) {
        return false;
      }
    }
    return true;
  });
}

// Task 4: Sort users by parameter
function sortUsers(users, parameter, order = 'asc') {
  return users.sort((a, b) => {
    if (a[parameter] < b[parameter]) {
      return order === 'asc' ? -1 : 1;
    }
    if (a[parameter] > b[parameter]) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  });
}

// Task 5: Find a user by a search parameter
function findUser(users, searchValue) {
  return users.find(user => {
    return Object.values(user).some(value => {
      if (typeof value === 'string' || typeof value === 'number') {
        return value.toString().includes(searchValue);
      }
      return false;
    });
  });
}

// Task 6: Calculate percentage of users matching a condition
function calculatePercentage(users, conditionFn) {
  const matchingUsers = users.filter(conditionFn);
  return (matchingUsers.length / users.length) * 100;
}

// Example usage:

// Task 1
const allUsers = transformAndMergeUsers(randomUserMock, additionalUsers);

// Task 2
const validation = validateUser(allUsers[0]);
if (validation === true) {
  console.log('User is valid.');
} else {
  console.log('User validation errors:', validation);
}

// Task 3
const filteredUsers = filterUsers(allUsers, { country: 'Germany', gender: 'male' });

// Task 4
const sortedUsers = sortUsers(allUsers, 'age', 'desc');

// Task 5
const foundUser = findUser(allUsers, 'Norbert');

// Task 6
const percentageOver30 = calculatePercentage(allUsers, user => user.age > 30);
console.log(`Percentage of users over 30: ${percentageOver30}%`);
