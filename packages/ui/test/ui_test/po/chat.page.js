import { expect } from '@playwright/test';

export default class ChatPage {
  constructor(page) {
    this.page = page;
    this.messageField = page.locator('textarea#standard-multiline-static');
    this.sendButton = page.locator('button[data-testid="SendButton"]');
    this.chatArea = page.locator('.MuiList-root');
    this.chatAreaAnswer = page.locator('.MuiList-root > li:nth-child(2) > div:nth-child(2) span');
    this.chatAreaPromptResult = page.locator('ul li div>p[style="margin-block-start: 0px;"]:nth-child(1)');
    this.refreshButton = page.locator('[data-testid="RefreshOutlinedIcon"]');
    this.scrollDownArrow = page.locator('[data-testid="KeyboardDoubleArrowDownOutlinedIcon"]');
    this.cleanChatButton = page.locator('[data-testid="ClearTheChatButton"]');
    this.chatCommandAutocomplete = page.locator('div.MuiPaper-root ul');
    this.promptModalHeader = page.locator('#alert-dialog-title:nth-child(1)');
    this.promptModalVariablesHeader = page.locator('#alert-dialog-title:nth-child(3)');
    this.promptModalVariable = page.locator('.MuiDialogContent-root .MuiInputBase-root textarea[aria-invalid="false"]');
    this.promptModalOkBtn = page.locator('button.MuiButton-root[type="button"]')
    this.promptSettingsOpenVariableModal = page.locator('[data-testid="SettingsButton"]');
    this.chosenPromptName = page.locator('//button[@data-testid="SettingsButton"]/preceding-sibling::span');
    this.serverError = page.locator('#webpack-dev-server-client-overlay');
    this.alertError = page.locator('svg[data-testid="ErrorOutlineIcon"]');
  }
  
  async openChat() {
    await this.page.goto('file:///C:/Users/tatiana_bontsevich2/Alita%20project/alitacodechat/packages/ui/dist-webpack/index.html');
  }

  async typeInMessageField(text) {
    await this.page.waitForTimeout(2000);
    await this.page.keyboard.type(text);
  }

  async checkAutocompleteOptions(expectedOptions) {
    for (let i = 0; i < expectedOptions.length; i++) {
      await expect(this.chatCommandAutocomplete.locator(`li`).nth(i)).toHaveText(expectedOptions[i]);
    }
  }

  async chooseAutocompleteOption(option) {
    const optionLocator = this.chatCommandAutocomplete.locator(`li >> text=${option}`);
    await optionLocator.waitFor();
    await optionLocator.click();
  }

  async checkPromptModalComponents(headerName) {
    await this.promptModalHeader.waitFor();
    await expect(this.promptModalHeader).toHaveText(headerName);
    await expect(this.promptModalVariablesHeader).toHaveText('Variables');
    await expect(this.promptModalVariable.nth(0)).toBeVisible();
  }

  async changePromptModalVariable(index, inputText) {
    await this.promptModalVariable.nth(index).type(inputText);
  }

  async applyPrompt() {
    await this.promptModalOkBtn.click();
  }

  async verifyChosenPrompt(promptName) {
    await expect(this.promptSettingsOpenVariableModal).toBeVisible();
    await expect(this.chosenPromptName).toHaveText(promptName);
  }

  async verifySettingsOpenPromptModal() {
    await this.promptSettingsOpenVariableModal.click();
    await this.promptModalHeader.waitFor();
    await expect(this.promptModalHeader).toBeVisible();
  }

  async sendMessage() {
    await this.sendButton.click();
    await this.page.waitForTimeout(500)
  }

  async verifyChatPromptResultExists() {
    await this.chatAreaPromptResult.waitFor();
    await expect(this.chatAreaPromptResult).toBeVisible();
  }

  async verifyErrorIsNotDisplayed() {
    const errorMessages = [
      /error/i,
      /failed to fetch/i,
      /xhr poll error/i,
    ];
    for (const errorMessage of errorMessages) {
      const errorLocator = this.page.locator(`text=${errorMessage}`);
      if (await errorLocator.isVisible()) {
        throw new Error('Some Error message is displayed.');
      }
    }
  }

  async verifyErrorOverlayNotDisplayed() {
    await this.page.waitForTimeout(2000);
    if (await this.serverError.isVisible()) {
      throw new Error('Error modal webpack-dev-server is displayed.');
    }
  }

  async verifyErrorAlertNotDisplayed() {
    if (await this.alertError.isVisible()) {
      throw new Error('Error alert is displayed.');
    }
  }
}
