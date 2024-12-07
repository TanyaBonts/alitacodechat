import { expect } from '@playwright/test';

export default class ChatPage {
  constructor(page) {
    this.page = page;
    this.messageField = page.locator('textarea#standard-multiline-static');
    this.sendButton = page.locator('button[data-testid="Sendbutton"]');
    this.chatArea = page.locator('.MuiList-root');
    this.refreshButton = page.locator('[data-testid="RefreshOutlinedIcon"]');
    this.scrollDownArrow = page.locator('[data-testid="KeyboardDoubleArrowDownOutlinedIcon"]');
    this.cleanChatButton = page.locator('[data-testid="ClearTheChat"]');
    this.chatCommandAutocomplete = page.locator('div.MuiPaper-root ul');
  }
  
  async openChat() {
    await this.page.goto('/');
  }

  async typeInMessageField(text) {
    await this.page.waitForTimeout(1500);
    await this.page.keyboard.type(text);
  }

  async checkAutocompleteOptions(expectedOptions) {
    for (let i = 0; i < expectedOptions.length; i++) {
      await expect(this.chatCommandAutocomplete.locator(`li`).nth(i)).toHaveText(expectedOptions[i]);
    }
  }
}
