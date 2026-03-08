interface Props { logs: string[] }

export const LogPanel = ({ logs }: Props) => (
  <section className="panel logs">
    <h3>전투/포획 로그</h3>
    <ul>
      {logs.slice(0, 8).map((log, index) => (
        <li key={`${index}-${log}`}>{log}</li>
      ))}
    </ul>
  </section>
);
