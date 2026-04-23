export default function TransactionTable({ data }) {
  return (
    <table>
      <tbody>
        {data.map((t) => (
          <tr key={t.id}>
            <td>{t.desc}</td>
            <td>{t.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}