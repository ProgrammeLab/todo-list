let modalInput = document.querySelector('.modal-input');
let onGoingList = document.querySelector('.content-ongoing ul');
let archiveList = document.querySelector('.content-archive ul');
let modifyingItem = null;

/**
 * 
 * @param {*} name 
 * @param {*} id 
 * @param {*} type 0 进行中 1 已完成 
 * @returns 
 */
const todoItemNode = function (name, id, type = 0) {
  const data = { name, id, type }
  return `<li>
  <input type="checkbox" ${type === 1 ? "checked" : ""} data-id=${id} data-type=${type} /> ${name}
  <span
    ><button data-id=${id} data-type=${type} class="delete">删除</button
    ><button data-value=${JSON.stringify(data)} data-id=${id} data-type=${type} class="modify">修改</button></span
  >
  </li>`
}

document.querySelector(".nav-right button").onclick = openModal

document.querySelector(".modal-control button:nth-child(2)").onclick = closeModal

/* 点击操作按钮时的操作 (已完成、修改、删除) */
document.getElementsByClassName("content")[0].onclick = function (e) {
  var li;
  // 如果是多选框
  li = e.target;
  if (li === null) {
    return;
  }
  if (li.tagName === "INPUT") {
    e.stopPropagation();

    const { type, id } = li.dataset;
    const { ONGOING = [], ARCHIVE = [] } = getTodos();
    exchange(type === '0' ? ARCHIVE : ONGOING, type === '0' ? ONGOING : ARCHIVE, id)
    localStorage.setItem("ITEMS", JSON.stringify({
      ONGOING,
      ARCHIVE
    }))
    onLoad();
    return;
  }

  // 如果是修改或删除按钮
  if (li.tagName === "BUTTON") {
    const { type, id, value } = li.dataset;
    const { ONGOING = [], ARCHIVE = [] } = getTodos();
    // 删除
    if (li.classList.contains('delete')) {
      deleteItem(Number(type) === 0 ? ONGOING : ARCHIVE, id);
      localStorage.setItem("ITEMS", JSON.stringify({
        ONGOING,
        ARCHIVE
      }))
    } else if (li.classList.contains('modify')) {
      // 修改
      modifyingItem = JSON.parse(value);
      setInputValue(JSON.parse(value));
      openModal();
    }
    onLoad()
  }

}

document.querySelector('#confirm').onclick = function (e) {
  if (!verify()) {
    return false;
  }

  // 修改
  if (modifyingItem) {
    const { id, type } = modifyingItem;
    const { ONGOING = [], ARCHIVE = [] } = getTodos();
    const target = Number(type) === 0 ? ONGOING : ARCHIVE;
    const index = target.findIndex(ele => ele.id === id);
    if (index === -1)
      return
    target[index].name = modalInput.value;
    localStorage.setItem("ITEMS", JSON.stringify({
      ONGOING,
      ARCHIVE
    }))
  } else {
    // 新增
    const id = +new Date();
    const value = modalInput.value;
    pushOngoing({
      id,
      name: value
    })
  }
  closeModal()
  onLoad();
}

function verify() {
  return modalInput.value !== '';
}

function clearModalInput() {
  modalInput.value = '';
}

function closeModal() {
  document.getElementsByClassName("modal")[0].style.display = "none";
  document.body.style.overflowY = "auto";
  clearModalInput();
  modifyingItem = null;
}

function openModal() {
  document.getElementsByClassName("modal")[0].style.display = "block";
  document.body.style.overflowY = "hidden";
}

function getTodos() {
  return JSON.parse(localStorage.getItem('ITEMS'));
}

/**
 * 添加 TODO
 * @param {
 * {
 *    id: number,
 *    name: string
 * }
 * } todoOption 
 */
function pushOngoing(todoOption) {
  let todos = getTodos();
  if (!todos) {
    todos = {};
    todos.ONGOING = [];
    todos.ARCHIVE = [];
  }
  todos.ONGOING.push(todoOption)
  localStorage.setItem("ITEMS", JSON.stringify(todos))
}

window.addEventListener('load', onLoad)

function onLoad() {
  const todos = getTodos();
  if (!todos) {
    return
  }
  // const onGoingFragment = this.document.createDocumentFragment();
  let onGoingFragment = '';
  // const archiveFragment = this.document.createDocumentFragment();
  let archiveFragment = '';
  const onGoing = todos['ONGOING'];
  const archive = todos['ARCHIVE'];
  onGoing.forEach((item) => {
    onGoingFragment += todoItemNode(item.name, item.id);
  })
  archive.forEach((item) => {
    archiveFragment += todoItemNode(item.name, item.id, 1);
  })

  onGoingList.innerHTML = onGoingFragment;
  archiveList.innerHTML = archiveFragment;
}

/**
 * transfer array item
 * @param {Array} array 
 * @param {Array} target 
 * @param {*} id 
 * @returns 
 */
function exchange(array, target, id) {
  const index = target.findIndex((ele) => {
    return String(ele.id) === id;
  })
  if (index === -1)
    return
  const res = target.splice(index, 1);
  array.push(res[0]);
}

/**
 * 删除待办
 * @param {*} array 
 * @param {*} id 
 * @returns 
 */
function deleteItem(array, id) {
  const index = array.findIndex(ele => {
    return String(ele.id) === id;
  })
  if (index === -1)
    return;
  array.splice(index, 1);
}

function setInputValue(value) {
  if (!value)
    return;
  modalInput.value = value.name
}