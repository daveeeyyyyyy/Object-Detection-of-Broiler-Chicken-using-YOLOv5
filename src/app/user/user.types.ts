interface User {
  _id?: string;
  name: string;
  lastname: string;
  username: string;
  password?: string;
  createdAt: Date;
}

export default User;
