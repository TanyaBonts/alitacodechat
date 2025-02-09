import { test, expect } from '@playwright/test';
import ChatPage from '../po/chat.page';

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
      'Calculation',
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
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.chooseAutocompleteOption('Test Cases Generator');
    await chatPage.checkPromptModalComponents('Test Cases Generator');
    await chatPage.changePromptModalVariable(1,'As a registered user, I want to log into my account using my email and password');
    await chatPage.applyPrompt();
    await chatPage.verifyChosenPrompt('Test Cases Generator');
    await chatPage.verifySettingsOpenPromptModal();
    await chatPage.changePromptModalVariable(0,'The project is an online learning platform aimed at delivering interactive courses to users.' +
      'It features user registration, course management, progress tracking, and certificate generation.');
    await chatPage.applyPrompt();
    await chatPage.verifyPromptModalClosed();
    await chatPage.verifyChosenPrompt('Test Cases Generator');
  });

  test('Verify user can choose prompt and receive result', async ({ page }) => {
    const chatPage = new ChatPage(page);
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.chooseAutocompleteOption('Test Cases Generator');
    await chatPage.applyPrompt();
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
    await chatPage.openChat();
    await chatPage.typeInMessageField('/');
    await chatPage.chooseAutocompleteOption('Calculation');
    await chatPage.checkPromptModalComponents('Calculation');
    await chatPage.verifyDisplayedVersion('latest');
    await chatPage.chooseVersion('1.1');
    await chatPage.verifyDisplayedVersion('1.1');
    await chatPage.verifyPromptModalVariableName(0, 'a');
    await chatPage.verifyPromptModalVariableName(1, 'b');
    await chatPage.changePromptModalVariable(0,'10');
    await chatPage.changePromptModalVariable(1,'5');
    await chatPage.applyPrompt();
    await chatPage.sendMessage('result is?');
    await chatPage.verifyChatPromptResultContent(2, '15');
    await chatPage.promptSettings.click();
    await chatPage.chooseVersion('2.1');
    await chatPage.verifyDisplayedVersion('2.1');
    await chatPage.verifyPromptModalVariableName(0, 'c');
    await chatPage.verifyPromptModalVariableName(1, 'd');
    await chatPage.changePromptModalVariable(0,'10');
    await chatPage.changePromptModalVariable(1,'5');
    await chatPage.applyPrompt();
    await chatPage.messageField.click();
    await chatPage.sendMessage('result is?');
    await chatPage.verifyChatPromptResultContent(4, '5');
  });
});
