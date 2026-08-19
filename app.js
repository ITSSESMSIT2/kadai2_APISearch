const form = document.querySelector("#searchForm");
let keyword = form.elements.keyword;

// 検索パネル
form.addEventListener("submit", function (e) {
  e.preventDefault();
  const searchWord = keyword.value.trim();
  if (searchWord === null || searchWord === "") {
    alert("検索キーワードを入力してください");
  } else {
    res(searchWord);
    keyword.value = "";
    return;
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
      console.log("こちらがjsonの中身である検索結果一覧です", data);
      // 配列の中身がゼロ件ならば
    } else {
      alert("検索結果は0件です");
    }
    // そもそも、APIにアクセスできない場合のエラーメッセージを表示
  } catch {
    alert("通信エラーが発生しました。");
  }
};
