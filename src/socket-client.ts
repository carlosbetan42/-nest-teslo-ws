import { Manager, Socket } from 'socket.io-client';

let socket: Socket;

export const connectToServer = (token: string) => {
  const manager = new Manager('http://localhost:3001/socket.io/socket.io.js', {
    extraHeaders: {
      hola: 'mundo',
      authentication: token,
    },
  });

  socket?.removeAllListeners();
  socket = manager.socket('/');

  addListeners();
};

const addListeners = () => {
  const serverStatusLabel = document.querySelector('#server-status')!;
  const clientsUl = document.querySelector('#clients-ul')!;
  const messageForm = document.querySelector<HTMLFormElement>('#message-form')!;
  const messageInput = document.querySelector<HTMLInputElement>('#message-input')!;
  const messagesUl = document.querySelector<HTMLUListElement>('#messages-ul')!;

  socket.on('connect', () => {
    serverStatusLabel.innerHTML = 'connected';
  });

  socket.on('disconnect', () => {
    serverStatusLabel.innerHTML = 'disconnect';
  });

  socket.on('clients-updated', (clients: string[]) => {
    let clientsHtml = '';
    clients.forEach((clientId: string) => {
      clientsHtml += `
      <li>${clientId}</li>
      `;
    });

    clientsUl.innerHTML = clientsHtml;
  });

  messageForm.addEventListener('submit', (event) => {
    event.preventDefault();
    if (messageInput.value.trim().length <= 0) {
      return;
    }

    socket.emit('message-from-client', { message: messageInput.value });
    messageInput.value = '';
  });

  socket.on('message-from-server', (payload: { fullName: string; message: string }) => {
    const newMessage = `
      <strong>${payload.fullName}</strong>
      <strong>${payload.message}</strong>
   `;

    const li = document.createElement('li');
    li.innerHTML = newMessage;
    messagesUl.appendChild(li);
  });
};
