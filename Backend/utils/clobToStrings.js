async function clobToString(clob) {
  if (!clob) return null;
  if (typeof clob === "string") return clob; // already string
  return new Promise((resolve, reject) => {
    let clobData = "";
    clob.setEncoding("utf8");
    clob.on("data", (chunk) => (clobData += chunk));
    clob.on("end", () => resolve(clobData));
    clob.on("error", (err) => reject(err));
  });
}
module.exports = clobToString;