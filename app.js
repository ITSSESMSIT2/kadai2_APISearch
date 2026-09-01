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
  if (state === "finish") {
    showStatus.textContent = "";
  } else if (state === "noResult") {
    showStatus.textContent = "検索結果は0件です。";
  } else if (state === "error") {
    showStatus.textContent = "接続エラーが発生しました。";
  }
};

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
  if (searching) {
    return;
  }
  const searchWord = keyword.value.trim();
  if (searchWord === "") {
    alert("キーワードを入力してください");
    return;
  }
  // 前回の入力値を取り消し、検索結果も一掃する。
  reset();
  // 状態変化に合わせて検索と描画を行う、handleSearchを呼び出し
  handleSearch(searchWord);
  // console.log("submit finish");
});

// resに持たせた三種類の処理を分離させる。まず、検索のみを行うfetchItems関数を作成。
const fetchItems = async (keyword) => {
  // このまま入力値を受け取ってしまうと、悪意ある入力を適用してしまう危険や、そもそも正確に調べることができなくなる。
  const url = new URL("https://qiita.com/api/v2/items");
  url.search = new URLSearchParams({
    query: keyword,
    page: "1",
    per_page: "20",
  });
  // fetchがPromiseを返してくれるまで一時停止
  const response = await fetch(url);
  // レスポンスが無事戻ってきていればtrueを返す、response.ok判定を確認
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
  // console.log("ul作成完了");
  // const resultPanel = document.querySelector("#resultPanel");
  // resultPanel.append(ul);
  // 今制作したul要素と、itemsの中に入った情報をセットにしてaddCardメソッドの中に入れる
  // →addCardメソッドの中で、ulをgetElemetByIdしなくとも取得できるようになる。
  // itemはitems配列の中の一つ一つの要素を指す(items自体は、取得したjsonの要素)
  items.forEach((elements) => addCard(elements, ul));
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
    // 検索状態を完了（＝文字入力フォーム初期化）
    searchStatus("finish");
  } catch (error) {
    console.log(error);
    searchStatus("error");
  } finally {
    searching = false;
    searchButton.disabled = false;
  }
};

// 業務上ではユーザーにどう見せるかなど。分析にも利用するので、「このAPIでエラーが出ました」など。
// throw new Error("レスポンスに失敗しました。");
// 確認用　console.log("レスポンス失敗");
// JSONが返却された際に、その情報からアイコン、タイトル、ユーザー名、ハッシュタグ、いいね数、投稿日を抽出し、liに追加し表示。
const addCard = (elements, ul) => {
  const card = document.createElement("li");
  card.className = "card";
  const title = document.createElement("span");
  title.innerText = `${elements.title}`;
  const name = document.createElement("span");
  // userのnameが存在しない場合、論理演算子の||（もしくは）を活用できる。
  // 従来の書き方では、もともとnullやundefinedの値を拾えない。
  // if (elements.user.name !== "") {
  //   name.innerText = `${elements.user.name}`;
  // } else {
  //   name.innerText = `@${elements.user.id}`;
  // }
  const nameValue = elements.user.name || `@${elements.user.id}`;
  name.innerText = nameValue;
  // 画像
  const imgDiv = document.createElement("div");
  imgDiv.className = "imgDiv";
  const icon = document.createElement("img");
  icon.id = "icon";
  const userIconUrl = elements.user.profile_image_url;
  icon.src = `${userIconUrl}`;
  // altは「ユーザー名（ユーザーid）のアイコン」と指定
  icon.alt = `${nameValue}のアイコン`;
  imgDiv.append(icon);
  // タグ
  const tag = document.createElement("span");
  tag.id = "tag";
  const tags = elements.tags
    // 配列tagsの中から、一番目から四番目の要素を切り取って新しい配列を作成し、
    .slice(0, 4)
    // その配列の中身のname要素を取り出し、さらに新たな配列を作る。
    // その際、ハッシュタグをテンプレートリテラルに添えて表記を変更する。
    .map((tags) => "#" + `${tags.name} `)
    // 最後に、配列の状態でまだ保持されているため文字として結合する。（「,」を消す）
    // その際、空文字をjoin（結合）することで「,」を消すことができる。
    .join("");
  tag.innerText = tags;
  // 画像のすぐ隣に配置するdivを用意し、タイトル・ユーザー名・タグを格納
  const leftItem = document.createElement("div");
  leftItem.className = "leftItem";
  leftItem.append(title, name, tag);
  // いいね
  const likes = document.createElement("span");
  likes.id = "likes";
  const likesImg = document.createElement("img");
  likesImg.src = "Vector.png";
  likesImg.alt = "@いいね数";
  const likesValue = `${elements.likes_count}`;
  // 投稿日
  likes.append(likesImg, likesValue);
  const date = document.createElement("span");
  date.id = "date";
  // 年月日のみの表示のため、文字列をslice
  const day = elements.created_at.slice(0, 10);
  date.innerText = day;
  // カードの右端に表示するためのdivを用意し、いいねと投稿日を格納
  const rightItem = document.createElement("div");
  rightItem.className = "rightItem";
  rightItem.append(likes, date);
  // カードに画像、左に配置する要素、右に配置する要素を加える
  card.append(imgDiv, leftItem, rightItem);
  ul.append(card);
};
