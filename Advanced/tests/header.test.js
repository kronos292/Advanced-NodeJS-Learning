const Page = require('./helpers/Page');

let page;

// Executed automatically before page runs
beforeEach(async() => {
    page = await Page.build();
    await page.goto('http://localhost:3000');
});

// Executed automatically after page runs
afterEach(async() => {
    await page.close();
});

test('The header has correct text', async() => {
    const text = await page.getContentsOf('a.brand-logo');
    expect(text).toEqual('Blogster');
});

test('Clicking login starts oauth flow', async() => {
    await page.click('.right a');
    const url = page.url();
    expect(url).toMatch(/accounts\.google\.com/);
});

test('When signed in, shows logout button', async() => {
    await page.login();
    const text = await page.$eval("a[href='/auth/logout']", el => el.innerHTML);
    expect(text).toEqual('Logout');
});