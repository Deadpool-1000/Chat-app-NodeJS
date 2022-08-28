const socket = io();
const form = document.getElementById("input-form");
const formButton = form.querySelector("button");
const $messages = document.getElementById("messages");

//templates
const messageTemplate = document.getElementById("message-template").innerHTML;
const locationTemplate = document.getElementById("location-template").innerHTML;
const sidebarTemplate = document.getElementById("sidebar-template").innerHTML;

//Query
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

socket.on("message", (message) => {
  const html = Mustache.render(messageTemplate, {
    username: message.username,
    message: message.text,
    createdAt: moment(message.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

socket.on("locationMessage", (location) => {
  const html = Mustache.render(locationTemplate, {
    username: location.username,
    location: location.url,
    createdAt: moment(location.createdAt).format("h:mm a"),
  });
  $messages.insertAdjacentHTML("beforeend", html);
  autoScroll();
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  formButton.setAttribute("disabled", "disabled");
  const message = e.target.elements.message.value;
  form.querySelector("input").value = "";
  form.querySelector("input").focus();
  socket.emit("sendMessage", message, (error) => {
    //runs after acknowledgement callback() is called
    formButton.removeAttribute("disabled");
    if (error) {
      return console.error(error);
    }
    console.log("Message sent");
  });
});

document.getElementById("send-location").addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("Sorry your browser does'nt support geolocation");
  }
  document.getElementById("send-location").setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const {
      coords: { latitude, longitude },
    } = position;
    socket.emit(
      "sendLocation",
      {
        latitude,
        longitude,
      },
      () => {
        //acknowledgement
        document.getElementById("send-location").removeAttribute("disabled");
        console.log("Location shared");
      }
    );
  });
});

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidebarTemplate, {
    room,
    users,
  });
  document.getElementById("sidebar").innerHTML = html;
});

socket.emit(
  "join",
  {
    username,
    room,
  },
  (error) => {
    if (error) {
      alert(error);
      location.href = "/";
    }
  }
);

const autoScroll = () => {
  const $newMessage = $messages.lastElementChild;

  //height of new message
  const allNewMessageStyle = getComputedStyle($newMessage);
  const newMessageMargin = parseInt(allNewMessageStyle.marginBottom);
  console.log(newMessageMargin);
  const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

  //visible height of messages
  const visibleHeight = $messages.offsetHeight;

  //height of messages
  const containerHeight = $messages.scrollHeight;

  const scrollOffset = $messages.scrollTop + visibleHeight;

  if (containerHeight - newMessageHeight <= scrollOffset) {
    $messages.scrollTop = $messages.scrollHeight;
  }
};
