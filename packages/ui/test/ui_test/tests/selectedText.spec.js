import { test, expect } from '@playwright/test';
import ChatPage from '../po/chat.page';

test.only('Verify selected text is sent in system message', async ({ page }) => {
  const log = (message) => console.log(`[TEST] ${message}`);

  // Эмулируем window.acquireVsCodeApi до загрузки страницы
  await page.context().addInitScript(() => {
  window.acquireVsCodeApi = () => ({
    postMessage: (message) => {
      console.log('[VS Code API] Intercepted postMessage call:', message);
      if (message.type === 'getSelectedText') {
        console.log('[VS Code API] Handling getSelectedText');
        window.dispatchEvent(new MessageEvent('message', {
          data: {
            type: 'ui.getSelectedText',
            data: 'This is mocked selected text',
          },
        }));
      }
    },
    getState: () => {
      console.log('[VS Code API] getState called');
      return null;
    },
    setState: (state) => {
      console.log('[VS Code API] setState called with:', state);
    },
  });
});


  // Создаем экземпляр страницы чата
  const chatPage = new ChatPage(page);

  // Открываем чат
  log('Chat opened');
  await chatPage.openChat();

  // Перехватываем WebSocket-сообщения
  const socketMessages = [];
  page.on('websocket', (ws) => {
    ws.on('framesent', (frame) => {
      const message = frame.payload.toString();
      log(`[WS] Raw frame sent: ${message}`);
      socketMessages.push(message);

      // Логируем только сообщения с promptlib_predict
      if (message.includes('"promptlib_predict"')) {
        try {
          const cleanedMessage = message.replace(/^[0-9]+/, '').trim(); // Удаляем числовой префикс
          const parsedMessage = JSON.parse(cleanedMessage);
          log(`[WS] → Matched promptlib_predict: ${JSON.stringify(parsedMessage[1], null, 2)}`);
        } catch (error) {
          log(`[ERROR] Failed to parse WebSocket message: ${error.message}`);
        }
      }
    });
  });

  // Отправляем сообщение в чат
  const userInput = 'hello';
  log('Sending user message...');
  await chatPage.sendMessage(userInput);
  log('Message sent');

  // Ждем некоторое время, чтобы WebSocket-сообщения успели отправиться
  log('Waiting for WebSocket messages...');
  await page.waitForTimeout(2000);

  // Проверяем, что WebSocket-сообщение содержит выделенный текст
  log('Checking WebSocket messages...');
  const relevantMessage = socketMessages.find((msg) =>
    msg.includes('"promptlib_predict"')
  );

  expect(relevantMessage).toBeDefined();
  log('Found WebSocket message with promptlib_predict.');

  const cleanedMessage = relevantMessage.replace(/^[0-9]+/, '').trim(); // Удаляем числовой префикс
  const parsedMessage = JSON.parse(cleanedMessage);

  const systemMessage = parsedMessage[1]?.messages?.find(
    (msg) => msg.role === 'system'
  );

  expect(systemMessage).toBeDefined();
  expect(systemMessage.content).toBe('This is mocked selected text');
  log('Selected text successfully sent in system message.');
});