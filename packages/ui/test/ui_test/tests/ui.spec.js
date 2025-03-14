import { test, expect } from '@playwright/test';
import ChatPage from '../po/chat.page';
import ModalComponents from '../po/modal.components';

test.describe('UI tests', () => {
  test('main elements should be visible', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await expect(chatPage.chatArea).toBeVisible();
    await expect(chatPage.messageField).toBeVisible();
    await expect(chatPage.sendButton).toBeVisible();
    await expect(chatPage.refreshButton).toBeVisible();
    await expect(chatPage.scrollDownArrow).toBeVisible();
    await expect(chatPage.cleanChatButton).toBeVisible();
  });

  test('Verify user can type any message and receive answer', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.sendMessage('hello');
    await chatPage.verifyErrorAlertNotDisplayed();
    await expect(chatPage.chatAreaAnswer).toBeVisible();
  });

  test('Verify that no errors are displayed', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.verifyErrorOverlayNotDisplayed();
    await chatPage.verifyErrorIsNotDisplayed();
  });

  test('Verify that the list of prompts matches the prompts from https://eye.projectalita.ai/', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.checkAutocompleteOptions([
      'Creating a JS class in Playwright',
      'Test Cases Generator',
      'Adviser'
    ]);
  });

  test('Verify that the list of datasources matches the datasources from https://eye.projectalita.ai/', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('#');
    await chatPage.checkAutocompleteOptions([
      'Create locator',
      'Git Repo Assistant',
      'Reskill to JS assistant',
      'Datasource Info - Confluence - Contribution activities'
    ]);
  });

  test('Verify that the list of agents matches the agents from https://eye.projectalita.ai/', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('@');
    await chatPage.checkAutocompleteOptions([
      'SDLC helper'
    ]);
  });

  test('Verify prompt pop-up appears with possibility to change variables', async ({ page }) => {
    const chatPage = new ChatPage(page);
    const modalComponents = new ModalComponents(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.chooseAutocompleteOption('Test Cases Generator');
    await modalComponents.checkPromptModalComponents('Test Cases Generator');
    await modalComponents.changePromptModalVariable(1,'As a registered user, I want to log into my account using my email and password');
    await modalComponents.applyPrompt();
    await chatPage.verifyChosenPrompt('Test Cases Generator');
    await chatPage.verifySettingsOpenPromptModal();
    await modalComponents.changePromptModalVariable(0,'The project is an online learning platform aimed at delivering interactive courses to users.' +
      'It features user registration, course management, progress tracking, and certificate generation.');
    await modalComponents.applyPrompt();
    await modalComponents.verifyPromptModalClosed();
    await chatPage.verifyChosenPrompt('Test Cases Generator');
  });

  test('Verify user can choose prompt and receive result', async ({ page }) => {
    const chatPage = new ChatPage(page);
    const modalComponents = new ModalComponents(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.chooseAutocompleteOption('Test Cases Generator');
    await modalComponents.applyPrompt();
    await expect(chatPage.sendButton).toBeDisabled();
    await chatPage.sendMessage('start');
    await chatPage.verifyChatPromptResultExists(2);
  });

  test('Verify user can delete one answer', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.sendMessage('start');
    await chatPage.verifyDeleteMessageBtnAndClick(2, 'Delete');
    await chatPage.checkDeleteMessageAlertComponents(`The deleted message can't be restored. Are you sure to delete the message?`);
    await chatPage.confirmDeleteMessage();
    await chatPage.verifyMessageIsDeleted(2);
  });

  test('Verify user can clean the chat', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.sendMessage('start');
    await chatPage.clickCleanChatBtn();
    await chatPage.checkDeleteMessageAlertComponents(`The deleted messages can't be restored. Are you sure to delete all the messages?`);
    await chatPage.confirmDeleteMessage();
    await chatPage.verifyChatIsCleaned();
  });

  test('Verify prompt versioning', async ({ page }) => {
    const chatPage = new ChatPage(page);
    const modalComponents = new ModalComponents(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.chooseAutocompleteOption('Adviser');
    await modalComponents.checkPromptModalComponents('Adviser');
    await modalComponents.verifyDisplayedVersion('latest');
    await modalComponents.chooseVersion('1.1');
    await modalComponents.verifyDisplayedVersion('1.1');
    await modalComponents.verifyPromptModalVariableName(0, 'a');
    await modalComponents.verifyPromptModalVariableName(1, 'b');
    await modalComponents.changePromptModalVariable(0,'10');
    await modalComponents.changePromptModalVariable(1,'5');
    await modalComponents.applyPrompt();
    await chatPage.sendMessage('result is?');
    await chatPage.verifyChatPromptResultContent(2, '15');
    await chatPage.promptSettings.click();
    await modalComponents.chooseVersion('2.1');
    await modalComponents.verifyDisplayedVersion('2.1');
    await modalComponents.verifyPromptModalVariableName(0, 'c');
    await modalComponents.verifyPromptModalVariableName(1, 'd');
    await modalComponents.changePromptModalVariable(0,'10');
    await modalComponents.changePromptModalVariable(1,'5');
    await modalComponents.applyPrompt();
    await chatPage.messageField.click();
    await chatPage.sendMessage('result is?');
    await chatPage.verifyChatPromptResultContent(4, '5');
  });

  test('SelectedText - Version 1', async ({ page }) => {
    const chatPage = new ChatPage(page);
    const testCases = [
      { mockSelectedText: 'This is test selection', expectedText: 'This is test selection' },
      { mockSelectedText: '', expectedText: '' }
  ];
    for (const { mockSelectedText, expectedText } of testCases) {
      console.log(`Testing with mockSelectedText: "${mockSelectedText}"`);

      await page.evaluate(mockText => {
        window.sendMessage = async function(message) {
            if (message.type === "getSelectedText") {
                console.log("🛠 Подмена sendMessage: возвращаем mockSelectedText");
                return mockText;
            }
        };
    }, mockSelectedText);
    
    await page.evaluate(() => {
      const originalWebSocket = window.WebSocket;
      window.WebSocket = function(...args) {
          console.log("🔗 WebSocket создан:", args);
          const ws = new originalWebSocket(...args);
  
          const originalSend = ws.send;
          ws.send = function(data) {
              console.log("📡 WebSocket отправка (перехвачено перед отправкой):", data);
  
              try {
                  const match = data.match(/^(\d+)\[(.*)\]$/);
                  if (match) {
                      const parsedArray = JSON.parse(`[${match[2]}]`);
                      const eventName = parsedArray[0];
                      const jsonData = parsedArray[1];
  
                      if (eventName === "promptlib_predict" && jsonData.messages) {
                          const systemMessage = jsonData.messages.find(msg => msg.role === "system");
                          if (systemMessage) {
                              console.log("🔄 Подмена текста перед отправкой:", systemMessage.content);
                              systemMessage.content = "This is test selection"; // Подмена перед отправкой
                          }
                      }
                      data = `${match[1]}[${JSON.stringify(parsedArray[1])}]`;
                  }
              } catch (e) {
                  console.error("❌ Ошибка при подмене WebSocket-сообщения:", e);
              }
  
              originalSend.call(this, data);
          };
  
          return ws;
      };
  });
  
      // let sentSelectedText = null;
      // page.on('websocket', ws => {
      //   ws.on('framesent', data => {
      //     const payload = data.payload.toString();
      //     console.log('Исходящее сообщение:', payload);
  
      //     const match = payload.match(/^(\d+)\[(.*)\]$/);
      //     if (match) {
      //         try {
      //             const parsedArray = JSON.parse(`[${match[2]}]`);
      //             const eventName = parsedArray[0]; 
      //             const jsonData = parsedArray[1]; 
  
      //             console.log(`Отправлен WebSocket Event: ${eventName}`, jsonData);
  
      //             // Проверяем, есть ли mockSelectedText в сообщении
      //             if (eventName === "promptlib_predict" && jsonData.messages) {
      //               const systemMessage = jsonData.messages.find(msg => msg.role === "system");
      //               if (systemMessage && systemMessage.content) {
      //                   sentSelectedText = systemMessage.content;
      //               }
      //           }
      //       } catch (e) {
      //           console.error('Ошибка при парсинге исходящего JSON:', e, 'Данные:', payload);
      //       }
      //     }
      // });
      // });
    await chatPage.openChat();
    await chatPage.sendMessage('Test message');
    await page.waitForTimeout(2000);
        
    // expect(sentSelectedText).toBe(expectedText);
}
});

test('Verify selected text - Version 2', async ({ page }) => {
  const chatPage = new ChatPage(page);
  const testCases = [
    { mockSelectedText: 'This is test selection', expectedText: 'This is test selection' },
    { mockSelectedText: '', expectedText: '' }
];
  for (const { mockSelectedText, expectedText } of testCases) {
    console.log(`Testing with mockSelectedText: "${mockSelectedText}"`);

    await page.route('**/?type=extension.getSelectedText', async (route, request) => {
      console.log('Перехваченный запрос:', request.url());
  
      const requestUrl = new URL(request.url());
      const requestId = requestUrl.searchParams.get('id') || 'random-id';
  
      const response = { 
          data: 'This is test selection',  
          id: requestId,           
          type: "ui.getSelectedText"
      };
  
      console.log('Отправляем мок:', JSON.stringify(response, null, 2));
  
      await route.fulfill({ json: response });
  });
  
  let sentSelectedText = null;
      page.on('websocket', ws => {
        ws.on('framesent', data => {
          const payload = data.payload.toString();
          console.log('Исходящее сообщение:', payload);
  
          const match = payload.match(/^(\d+)\[(.*)\]$/);
          if (match) {
              try {
                  const parsedArray = JSON.parse(`[${match[2]}]`);
                  const eventName = parsedArray[0]; 
                  const jsonData = parsedArray[1]; 
  
                  console.log(`Отправлен WebSocket Event: ${eventName}`, jsonData);
                  if (eventName === "promptlib_predict" && jsonData.messages) {
                    const systemMessage = jsonData.messages.find(msg => msg.role === 'system');
                    if (systemMessage) {
                        sentSelectedText = systemMessage.content;
                        console.log("Найдено selectedText в WebSocket:", sentSelectedText);
                    }
                }
              } catch (e) {
                  console.error('Ошибка при парсинге исходящего JSON:', e, 'Данные:', payload);
              }
          }
      });
      });
    
      await page.evaluate(() => {
        // Перехват WebSocket ДО его создания
        const originalWebSocket = window.WebSocket;
        window.WebSocket = function(...args) {
            console.log("WebSocket создан:", args);
            const ws = new originalWebSocket(...args);
            const originalSend = ws.send;
            ws.send = function(data) {
                console.log("WebSocket отправка (перехвачено до открытия):", data);
                originalSend.apply(this, arguments);
            };
            return ws;
        };
    });

    await chatPage.openChat();

    // Дождемся появления selectedText
    await page.waitForFunction(() => window.selectedText !== undefined, { timeout: 5000 });
    const selectedText = await page.evaluate(() => window.selectedText);
    console.log("window.selectedText найден:", selectedText);

    // Выведем все глобальные переменные (для доп. анализа)
    await page.evaluate(() => {
      console.log("Все глобальные переменные:", Object.keys(window));
    });

    await chatPage.sendMessage('Test message');
    await page.waitForFunction(() => window.sentSelectedText !== null, { timeout: 5000 });
        
    expect(sentSelectedText).toBe(expectedText);
}
});

test.only('Verify selected text - Version 3', async ({ browser }) => {
  const context = await browser.newContext();
  const page = await context.newPage();
  const chatPage = new ChatPage(page);

  // Step 1: Создаём скрипт для VS Code API
  await context.addInitScript(() => {
    window.sendMessage = function ({ type }) {
      console.log(`[EVALUATE] VS Code API called with type: ${type}`);
      if (type === 'extension.getSelectedText') {
        return Promise.resolve({ data: 'This is test selection', id: 'mock-id', type: 'ui.getSelectedText' });
      }
    };
  });

  // Step 2: Интерцепция WebSocket
  await context.addInitScript(() => {
    const originalWebSocket = window.WebSocket;

    window.WebSocket = function (...args) {
      const ws = new originalWebSocket(...args);
      const originalSend = ws.send;

      ws.send = function (data) {
        console.log("[WebSocket] Sent message:", data);
        originalSend.apply(ws, [data]);
      };
      return ws;
    };
  });

  await chatPage.openChat();
  console.log("Chat opened.");

  // Step 4: Send message
  await chatPage.sendMessage('Test message');
  console.log("Message sent.");

  // Step 6: Захват WebSocket кадров
  let sentSelectedText = null;

  page.on('websocket', (ws) => {
    console.log("[WebSocket] Connection opened:", ws.url());

    ws.on('framesent', (frame) => {
      const message = frame.payload.toString();
      console.log("[WebSocket] Frame sent:", message);

      if (message.includes('promptlib_predict')) {
        const [eventName, payload] = JSON.parse(message.slice(message.indexOf('[')));
        const systemMessage = payload.messages.find((msg) => msg.role === 'system');
        if (systemMessage) {
          sentSelectedText = systemMessage.content;
          console.log("[WebSocket] Selected text captured:", sentSelectedText);
        }
      }
    });
  });

  // Ожидание и проверка результата
  await page.waitForTimeout(3000);
  expect(sentSelectedText).toBe('This is test selection');
});

  

});
