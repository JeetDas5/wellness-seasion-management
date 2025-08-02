type User = {
  id: string;
  email: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
};

type Session = {
  userId: string;
  title: string;
  tags?: string[];
  json_file_url?: string;
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
};
