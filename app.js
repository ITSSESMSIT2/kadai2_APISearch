const form = document.querySelector("#searchForm");
let keyword = form.elements.keyword;
const list = [];

form.addEventListener("submit", function (e) {
  e.preventDefault();
  const searchWord = keyword.value.trim();
  if (searchWord === null || searchWord === "") {
    alert("検索キーワードを入力してください");
  } else {
    list.push(searchWord);
    console.log(list);
    keyword.value = "";
  }
});
