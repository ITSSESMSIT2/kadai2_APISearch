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
    // このまま入力値を受け取ってしまうと、悪意ある入力を適用してしまう危険や、そもそも正確に調べることができなくなる。
    // 確認用　console.log("tryの中には入った");
    const url = new URL("https://qiita.com/api/v2/items");
    url.search = new URLSearchParams({
      query: keyword,
      page: "1",
      per_page: "20",
    });
    // 確認用　console.log("URL組み立て成功");
    // fetchがPromiseを返してくれるまで一時停止
    const response = await fetch(url);
    // レスポンスが無事戻ってきていればtrueを返す、response.ok判定を確認
    if (response.ok === true) {
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
    } else {
      // 業務上ではユーザーにどう見せるかなど。分析にも利用するので、「このAPIでエラーが出ました」など。
      throw new Error("レスポンスに失敗しました。");
      // 確認用　console.log("レスポンス失敗");
    }
    // そもそも、APIにアクセスできない場合のエラーメッセージを表示
  } catch {
    alert("通信エラーが発生しました。");
  }
};
