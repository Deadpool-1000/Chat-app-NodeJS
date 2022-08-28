const users = [];

const addUser = ({ id, username, room }) => {
  //clean the data
  username = username.trim().toLowerCase();
  room = room.trim().toLowerCase();

  //validate the data
  if (!username || !room) {
    return {
      error: "Username and room is required",
    };
  }

  //check for existing user
  const existsUser = users.find(
    (user) => user.room === room && user.username === username
  );
  if (existsUser) {
    return {
      error: "User already exists",
    };
  }

  //store the user
  const newUser = { id, username, room };
  users.push(newUser);
  return { user: newUser };
};

const removeUser = (id) => {
  //Find user index
  const index = users.findIndex((user) => user.id === id);
  const removedUser = users.splice(index, 1);
  if (index !== -1) {
    return { user: removedUser[0] };
  } else {
    return { error: "Could not remove user" };
  }
};

const getUser = (id) => {
  return users.find((user) => user.id === id);
};

const getUsersInRoom = (room) => {
  room = room.trim().toLowerCase();
  return users.filter((user) => user.room === room);
};

module.exports = {
  addUser,
  removeUser,
  getUsersInRoom,
  getUser,
};
