const form = document.querySelector("#searchForm");
let keyword = form.elements.keyword;

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
  const searchWord = keyword.value.trim();
  if (searchWord === null || searchWord === "") {
    alert("検索キーワードを入力してください");
  } else {
    res(searchWord);
    console.log("submit finish");
    reset();
  }
});

// 結果を取得
// データを取得する際の処理を一時停止させておきたいので、async関数を利用。
const res = async (keyword) => {
  // tryとthenでは意味が重複するので、今回は仕様書よりtryを利用
  try {
    // fetchがPromiseを返してくれるまで一時停止
    const response = await fetch(
      `https://qiita.com/api/v2/items?query=${keyword}&page=1&per_page=20`,
    );
    // レスポンスが無事戻ってきていればtrueを返す、response.ok判定を確認
    console.log(response.ok);
    console.log("レスポンスに成功しました", response);
    // 返ってきたレスポンスからjsonを呼び出し、jsonの中身が返ってくるまで一時停止
    const data = await response.json();
    // 検索結果に応じて分岐を作成。jsonの中身は配列の形で返ってきている。
    if (data.length !== 0) {
      console.log("こちらがjsonの中身である検索結果一覧です");
      // ul要素作成
      const ul = document.createElement("ul");
      ul.id = "ul";
      const resultPanel = document.querySelector("#resultPanel");
      resultPanel.append(ul);
      // ulの中に情報を描画する関数を、配列の各要素に処理を適用するforEachで呼び出し。
      data.forEach(addCard);

      // 配列の中身がゼロ件ならば
    } else {
      alert("検索結果は0件です");
    }
    // そもそも、APIにアクセスできない場合のエラーメッセージを表示
  } catch {
    alert("通信エラーが発生しました。");
  }
};

// JSONが返却された際に、その情報からアイコン、タイトル、ユーザー名、ハッシュタグ、いいね数、投稿日を抽出し、liに追加し表示。
const addCard = (elements) => {
  const card = document.createElement("li");
  card.className = "card";
  const icon = document.createElement("img");
  const userIconUrl = elements.user.profile_image_url;
  icon.src = `${userIconUrl}`;
  icon.className = "userIcon";
  const title = document.createElement("span");
  title.innerText = `${elements.title}`;
  const name = document.createElement("span");
  name.innerText = `${elements.user.name}`;
  const tag = document.createElement("span");
  tag.innerText = `${elements.tags.name}`;
  const likes = document.createElement("span");
  const likesImg = document.createElement("img");
  likesImg.src = "Vector.png";
  likesImg.ariaLabel = "いいね数";
  const likesValue = `${elements.likes_count}`;
  likes.append(likesImg, likesValue);
  const date = document.createElement("span");
  date.innerText = `${elements.created_at}`;
  card.append(icon, title, name, tag, likes, date);
  ul.append(card);
};
