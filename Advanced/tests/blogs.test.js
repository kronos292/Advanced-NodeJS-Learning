const Page = require('./helpers/page');

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

describe('When logged in', async() => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('Can see blog creation form', async() => {
        await page.login();
        await page.click('a.btn-floating');
        const label = await page.getContentsOf('form label');
        expect(label).toEqual('Blog Title');
    });

    describe('Using valid inputs', async() => {
        beforeEach(async () => {
            await page.type('.title input', 'My Title');
            await page.type('.content input', 'My Content');
            await page.click('form button');
        });

        test('Submitting takes user to review screen', async() => {
            const text = await page.getContentsOf('h5');
            expect(text).toEqual('Please confirm your entries');
        });

        test('Submitting then saving adds blog to index page', async() => {
            await page.click('button.green');
            await page.waitFor('.card');

            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('My Title');
            expect(content).toEqual('My Content');
        });
    });

    describe('Using invalid inputs', async() => {
        beforeEach(async () => {
            await page.click('form button');
        });

        test('The form shows an error message', async() => {
            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');
            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('When not logged in', async() => {
    test('User cannot create blog posts', async() => {
        const result = await page.evaluate(() => {
            return fetch('/api/blogs', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: 'My Title',
                    content: 'My Content'
                })
            }).then(res => res.json());
        });

        expect(result).toEqual({
            error: 'You must log in!'
        });
    });

    test('User cannot get a list of posts', async() => {
        const result = await page.evaluate(() => {
            return fetch('/api/blogs', {
                method: 'get',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(res => res.json());
        });

        expect(result).toEqual({
            error: 'You must log in!'
        });
    });
});