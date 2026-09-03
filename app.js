const form = document.querySelector("#searchForm");
let keyword = form.elements.keyword;
const searchButton = document.querySelector("#searchButton");
const showStatus = document.querySelector("#showStatus");
let searching = false;

// ステータスにあわせた表示を行うための関数を作成
const searchStatus = (state) => {
  // 読み込み中の時
  if (state === "loading") {
    searching = true;
    searchButton.disabled = true;
    showStatus.textContent = "検索中";
    return;
  }
  // 完了
  if (state === "finish") {
    showStatus.textContent = "";
    // 検索結果0件
  } else if (state === "noResult") {
    showStatus.textContent = "検索結果は0件です。";
    // 接続エラー
  } else if (state === "error") {
    showStatus.textContent = "接続エラーが発生しました。";
  }
};

// 検索の入力値と結果の画面表示を初期化
const reset = () => {
  keyword.value = "";
  const ul = document.getElementById("ul");
  if (ul !== null) {
    ul.remove();
  }
};

// 検索パネル
form.addEventListener("submit", function (e) {
  e.preventDefault();
  // 検索中なら処理を行わず返す
  if (searching) {
    return;
  }
  // 入力値を正確にクエリに渡すため、文字列の空白を削除
  const searchWord = keyword.value.trim();
  if (searchWord === "") {
    alert("キーワードを入力してください");
    return;
  }
  // 前回の入力値を取り消し、検索結果も一掃する。
  reset();
  // 状態変化に合わせて検索と描画を行う、handleSearchを呼び出し
  handleSearch(searchWord);
});

// resに持たせた三種類の処理を分離させる。まず、検索のみを行うfetchItems関数を作成。
const fetchItems = async (keyword) => {
  const url = new URL("https://qiita.com/api/v2/items");
  url.search = new URLSearchParams({
    query: keyword,
    page: "1",
    per_page: "20",
  });
  // fetchがPromiseを返すまで一時停止
  const response = await fetch(url);
  // response.ok判定を利用し、レスポンスが戻らなかった場合、エラーを投げる。
  if (!response.ok) {
    throw new Error(`HTTP error: ${response.status}`);
  }
  // 返ってきたレスポンスからjsonを呼び出し、jsonの中身が返ってくるまで一時停止
  return await response.json();
};

// 続いて、検索結果を画面に表示するrenderItems関数を作成
const renderItems = (items) => {
  const ul = document.createElement("ul");
  ul.id = "ul";
  // 今制作したul要素と、itemsの中に入った情報をセットにしてaddCardメソッドに適用
  items.forEach((item) => addCard(item, ul));
  document.querySelector("#resultPanel").append(ul);
};

// 上記二種類の関数を利用し、状態変化を設定する。（// 1回の検索について、状態変更・取得・描画の順序を管理する）
const handleSearch = async (searchWord) => {
  try {
    //検索開始
    searchStatus("loading");
    const items = await fetchItems(searchWord);
    // 検索結果が0件の場合、0件であることを明示し処理を終了（＝if文を書かなくてよい）
    if (items.length === 0) {
      searchStatus("noResult");
      return;
    }
    // 記事がある場合、renderItemsを利用し画面に描画
    renderItems(items);
    // 検索状態を完了（＝画面表示初期化）
    searchStatus("finish");
    // エラー発生時
  } catch (error) {
    console.log(error);
    searchStatus("error");
    // 検索が成功しても失敗しても、検索を再度有効にする
  } finally {
    searching = false;
    searchButton.disabled = false;
  }
};

// JSONが返却された際に、その情報から画面に表示するものを抽出し、liに追加。
const addCard = (item, ul) => {
  const card = document.createElement("li");
  card.className = "card";
  // 記事タイトル
  const title = document.createElement("span");
  title.className = "title";
  title.innerText = `${item.title}`;
  // ユーザー名（未登録の場合、ユーザーid）
  const name = document.createElement("span");
  name.className = "name";
  // userのnameが存在しない場合、論理演算子の||（もしくは）を活用できる。
  const nameValue = item.user.name || `@${item.user.id}`;
  name.innerText = nameValue;
  // 画像
  const icon = document.createElement("img");
  icon.className = "icon";
  const userIconUrl = item.user.profile_image_url;
  icon.src = `${userIconUrl}`;
  // altは「ユーザー名（ユーザーid）のアイコン」と指定
  icon.alt = `${nameValue}のアイコン`;
  // タグ
  const tag = document.createElement("span");
  tag.className = "tag";
  const tags = item.tags
    .slice(0, 4)
    .map((tags) => "#" + `${tags.name} `)
    .join("");
  tag.innerText = tags;
  // 画像のすぐ隣に配置するdivを用意し、タイトル・ユーザー名・タグを格納
  const leftItem = document.createElement("div");
  leftItem.className = "leftItem";
  leftItem.append(title, name, tag);
  // いいね
  const likes = document.createElement("span");
  likes.className = "likes";
  const likesImg = document.createElement("img");
  likesImg.src = "Vector.png";
  likesImg.alt = "@いいね数";
  const likesValue = `${item.likes_count}`;
  // 投稿日
  likes.append(likesImg, likesValue);
  const date = document.createElement("span");
  date.className = "date";
  // 年月日のみの表示のため、文字列をslice
  const day = item.created_at.slice(0, 10);
  date.innerText = day;
  // カードの右端に表示するためのdivを用意し、いいねと投稿日を格納
  const rightItem = document.createElement("div");
  rightItem.className = "rightItem";
  rightItem.append(likes, date);
  // カードに画像、左に配置する要素、右に配置する要素を加える
  card.append(icon, leftItem, rightItem);
  ul.append(card);
};
