import { Page, Locator } from '@playwright/test';
import { HeaderComponent } from "../components/header.component";

/**
 * page is now protected, so tests can't bypass the page object.
 * When a test need page (for example for toHaveURL), it takes it from the fixture.
 */
export abstract class BasePage {
    readonly header: HeaderComponent;

    constructor(protected readonly page: Page) {
        this.header = new HeaderComponent(page);
    }

    abstract goto(...args: string[]): Promise<void>;
}