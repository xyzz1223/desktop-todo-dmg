const textEl   = document.getElementById('text');
const remindEl = document.getElementById('remind');
const listEl   = document.getElementById('list');
const addBtn   = document.getElementById('add');

// ---- 渲染待办列表 ----
async function render() {
  try {
    const todos = await window.api.list();
    console.log('render: got', todos.length, 'todos');
    listEl.innerHTML = '';
    todos.forEach(t => {
      const li = document.createElement('li');
      if (t.done) li.classList.add('done');

      const span = document.createElement('span');
      if (t.remindAt) {
        const d = new Date(t.remindAt);
        const pad = n => String(n).padStart(2, '0');
        const dateStr = `${d.getFullYear()}/${pad(d.getMonth()+1)}/${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
        span.textContent = t.text + '  ⏰ ' + dateStr;
      } else {
        span.textContent = t.text;
      }

      const del = document.createElement('button');
      del.textContent = '×';
      del.addEventListener('click', async (e) => {
        e.stopPropagation();
        await window.api.remove(t.id);
        render();
      });

      li.appendChild(span);
      li.appendChild(del);

      li.addEventListener('click', async () => {
        await window.api.toggle(t.id);
        render();
      });

      listEl.appendChild(li);
    });
  } catch (e) {
    console.error('render error:', e);
  }
}

const cardEl   = document.querySelector('.card');

// ---- 折叠 / 展开窗口 ----
document.getElementById('btn-collapse').addEventListener('click', () => {
  cardEl.classList.add('collapsed');
  window.api.resizeWindow(420, 64);
});

document.getElementById('btn-expand').addEventListener('click', () => {
  cardEl.classList.remove('collapsed');
  window.api.resizeWindow(420, 540);
});

// ---- 关闭窗口 ----
document.getElementById('btn-close').addEventListener('click', () => {
  window.api.closeWindow();
});

// ---- 添加待办 ----
function doAdd() {
  const v = textEl.value.trim();
  console.log('doAdd called, text:', v);
  if (!v) {
    console.log('doAdd: empty text, skip');
    return;
  }
  const remindVal = remindEl.value;
  console.log('doAdd: remindVal =', remindVal);
  const todo = {
    text: v,
    remindAt: remindVal ? new Date(remindVal).toISOString() : null
  };
  console.log('doAdd: calling api.add with', todo);

  window.api.add(todo).then(() => {
    console.log('doAdd: added successfully');
    textEl.value = '';
    remindEl.value = '';
    render();
  }).catch(err => {
    console.error('doAdd: add failed', err);
    alert('添加失败: ' + err.message);
  });
}

// 使用 addEventListener 替代 onclick（更可靠）
addBtn.addEventListener('click', () => {
  console.log('addBtn clicked');
  doAdd();
});

// Enter 键也可添加
textEl.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    console.log('Enter pressed in text input');
    doAdd();
  }
});

// ---- 初始渲染 ----
render();
