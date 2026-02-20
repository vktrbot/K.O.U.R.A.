export default interface IConnectionProfile {
  id: string;
  name: string;
  connection_type: string;
  host: string;
  port: number;
  auth_token?: string;
  is_active: boolean;

  setActive(state: boolean);
}