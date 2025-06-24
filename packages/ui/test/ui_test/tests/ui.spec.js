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

  test('Verify that the prompt list in the plugin matches the prompt list from the main project', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.checkAutocompleteOptions([
      'Simple Calculator',
      'Test Cases Generator',
      'Adviser'
    ]);
  });

  test('Verify that the datasources list in the plugin matches the datasources list from the main project', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('#');
    await chatPage.checkAutocompleteOptions([
      'Enhance Test Cases',
      'Create locator',
      'Git Repo Assistant',
      'Reskill to JS assistant'
    ]);
  });

  test('Verify that the agents list in the plugin matches the agents list from the main project', async ({ page }) => {
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
    await chatPage.chooseAutocompleteOption('Simple Calculator');
    await modalComponents.checkPromptModalComponents('Simple Calculator');
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

//   test.only('Verify selected text is sent in system message', async ({ page }) => {
//  await page.addInitScript(() => {
//     window.__sentMessages = [];
//   });

//   // Подключаемся к WebSocket и слушаем framesent
//   page.on('websocket', ws => {
//     console.log('[WS] Opened:', ws.url());

//     ws.on('framesent', async ({ payload }) => {
//       console.log('[WS] Raw frame sent:', payload);

//       if (typeof payload !== 'string' || !payload.startsWith('42')) return;

//       try {
//         const cleaned = payload.slice(2);
//         const data = JSON.parse(cleaned);
//         console.log('[WS] Parsed data:', data);

//         if (Array.isArray(data) && data[0] === 'promptlib_predict') {
//           const message = data[1];
//           console.log('[WS] → Matched promptlib_predict:', message);
//           await page.evaluate(m => window.__sentMessages.push(m), message);
//         }
//       } catch (e) {
//         console.log('[WS] Failed to parse payload:', payload);
//       }
//     });
//   });

//   const chatPage = new ChatPage(page);
//   await chatPage.openChat();
//   console.log('[TEST] Chat opened');

//   // 🛠️ Мокаем sendMessage ПОСЛЕ загрузки страницы
//   await page.evaluate(() => {
//     console.log('[MOCK] Overriding sendMessage in page context');
//     window.dataContext = {
//       ...window.dataContext,
//       sendMessage: ({ type }) => {
//         console.log('[MOCK] sendMessage called with type:', type);
//         if (type === 'ui.getSelectedText') {
//           return Promise.resolve('This is mocked selected text');
//         }
//         return Promise.resolve('');
//       },
//     };
//   });

//   // Отправляем сообщение
//   await chatPage.sendMessage('hello');
//   console.log('[TEST] Message sent');

//   // Ждём появления сообщения в __sentMessages
//   await page.waitForFunction(() => window.__sentMessages.length > 0, null, { timeout: 5000 });

//   const messages = await page.evaluate(() => window.__sentMessages);
//   console.log('[TEST] Captured messages:', messages);

//   const [target] = messages;

//   expect(target).toBeTruthy();
//   expect(target.messages[0]).toEqual({
//     role: 'system',
//     content: 'This is mocked selected text',
//   });
// });

});
