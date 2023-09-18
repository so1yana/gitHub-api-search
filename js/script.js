let searchInput = document.querySelector('.search__input');
let searchList = document.querySelector('.search__results-list');
let deleteButton = document.querySelectorAll('.delete-container');
let reposList = document.querySelector('.repos-list');
let listItems = document.querySelectorAll('.repos-list__item');

const debounce = (fn, throttleTime) => {
    let timeout;

    function wrapper() {
        let callFn = () => fn.apply(this, arguments)

       clearTimeout(timeout);

       timeout = setTimeout(callFn, throttleTime);
    }

    return wrapper;
};


function clearChilds(element) {
    while (element.firstChild) {
        element.removeChild(element.firstChild)
    }
}


function addRepoItem(event) {
    let fragment = document.createDocumentFragment();
    let item = document.createElement('div');
    item.classList.add('repos-list__item');
    let itemInfo = document.createElement('div');
    itemInfo.classList.add('repos-list__item-info');
    itemInfo.setAttribute('href', event.url)
    let itemName = document.createElement('span');
    itemName.textContent = `Name: ${event.name}`;
    let itemOwner = document.createElement('span');
    itemOwner.textContent = `Owner: ${event.owner}`;
    let itemStars = document.createElement('span');
    itemStars.textContent = `Stars: ${event.stars}`;
    let buttonContainer = document.createElement('div');
    buttonContainer.classList.add('delete-container');
    let itemButton = document.createElement('span');
    itemButton.classList.add('repos-list__item-button');
    buttonContainer.addEventListener('click', deleteRepos);
    buttonContainer.appendChild(itemButton)
    itemInfo.appendChild(itemName);
    itemInfo.appendChild(itemOwner);
    itemInfo.appendChild(itemStars);
    itemInfo.appendChild(buttonContainer);
    itemInfo.addEventListener('click', openNewTab);
    item.appendChild(itemInfo)
    fragment.appendChild(item);
    clearChilds(searchList);
    searchInput.value = '';
    reposList.appendChild(fragment);
}


function sendRequest(event) {
    let reqData = event.target.value;
    fetch(`https://api.github.com/search/repositories?q=${reqData}&per_page=5`)
        .then(data => data.json())
        .then(data => {
            let newArr = data.items.map(element => {
                let el = {
                    name: element.name,
                    owner: element.owner.login,
                    stars: element.stargazers_count,
                    url: element.html_url,
                }
                return el;
            })
            return newArr;
        })
        .then((array) => {
            clearChilds(searchList)
            let fragment = document.createDocumentFragment()
            array.map(el => {
                let item = document.createElement('li')
                item.classList.add('search__result-item')
                item.textContent = el.name;
                item.addEventListener('click', () => addRepoItem(el))
                fragment.appendChild(item)
            })
            searchList.appendChild(fragment)
        })
        .catch(error => error)
}

sendRequest = debounce(sendRequest, 250)


function deleteRepos(event) {
    let delListener = event.target.closest('.repos-list__item-info')
    let delBlock = event.target.closest('.repos-list__item')
    delBlock.remove()
    delListener.removeEventListener('click', openNewTab);
}

function openNewTab(event) {
    let url = event.target.attributes.href.value
    window.open(url)
}


searchInput.addEventListener('keyup', (e) => {
    if (searchInput.value.replace(/ /g,'') !== '') sendRequest(e);
    else clearChilds(searchList)
})

deleteButton.forEach(el => {
    el.addEventListener('click', e => {
        e.stopPropagation();
        deleteRepos(e);
    })
})

listItems.forEach(el => {
    el.addEventListener('click', openNewTab)
})