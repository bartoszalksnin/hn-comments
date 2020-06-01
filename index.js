async function init() {
    const hnStoryItemId = 8863;
    const rootDiv = document.getElementById('hn-comments');

    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = `Comments as seen on <a href="https://news.ycombinator.com/item?id=${hnStoryItemId}" target="_blank">hacker news</a>`
    titleDiv.setAttribute('style', 'margin-bottom: 15px')

    const loadingDiv = document.createElement('div');
    loadingDiv.innerHTML = `Loading ...`

    rootDiv.appendChild(titleDiv);
    rootDiv.appendChild(loadingDiv);

    const item = await fetchItem(hnStoryItemId);
    await renderItem(rootDiv, item, 0);
    loadingDiv.remove();
}

async function fetchItem(hnStoryItemId) {
    const response = await fetchItemRequest(hnStoryItemId);
    const item = await response.json();
    return item;
}

async function renderItem(rootDiv, item, index) {
    const data = await Promise.all(item.kids.map((item) => fetchItemRequest(item).then(response => response.json())))

    data.forEach((comment) => {
        renderComment(comment, rootDiv, index);
    });
}

function renderComment(comment, rootDiv, index) {
    const date = new Date(comment.time * 1000);
    const commentDiv = document.createElement('div');

    const childrenContainer = document.createElement('div');
    childrenContainer.id = 'children';

    const authorDiv = document.createElement('div');
    if('kids' in comment && comment.kids.length > 0) {
        const button = document.createElement('button')
        button.onclick = () => expandStory(comment, childrenContainer, button, index + 1)
        button.insertAdjacentHTML('afterbegin', '[+]');
        button.setAttribute('style', 'border: none; background-color: #fff')
        authorDiv.appendChild(button);
    }

    authorDiv.insertAdjacentHTML('afterbegin', date.toDateString());
    authorDiv.insertAdjacentHTML('afterbegin', `<strong>${comment.by} </strong>`);
    authorDiv.setAttribute('style', 'margin-bottom: 8px');

    const commentBodyDiv = document.createElement('div');
    commentBodyDiv.insertAdjacentHTML('afterbegin', comment.text);
    commentBodyDiv.setAttribute('style', 'margin-bottom: 10px')

    commentDiv.append(authorDiv);
    commentDiv.append(commentBodyDiv);
    commentDiv.append(document.createElement('br'));
    commentDiv.append(childrenContainer);
    commentDiv.setAttribute('style', `margin-left: ${index * 25}px`)
    rootDiv.append(commentDiv);
}

async function fetchItemRequest(itemId) {
    return fetch(`https://hacker-news.firebaseio.com/v0/item/${itemId}.json`);
}

function removeAllChildren(childrenContainer) {
    while (childrenContainer.lastChild) {
        childrenContainer.removeChild(childrenContainer.lastChild);
    }
}

async function expandStory(commentItem, childrenContainer, button, index) {
    button.onclick = null;
    removeAllChildren(childrenContainer);

    await renderItem(childrenContainer, commentItem, index);
    button.innerHTML = '[-]';
    button.onclick = () => collapseStory(commentItem, childrenContainer, button, index);
}

async function collapseStory(data, childrenContainer, button, index) {
    button.onclick = null;
    await removeAllChildren(childrenContainer);

    button.innerHTML = '[+]';
    button.onclick = () => expandStory(data, childrenContainer, button, index);
}

init();