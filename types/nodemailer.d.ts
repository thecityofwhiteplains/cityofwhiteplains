declare module "nodemailer" {
  // Minimal fallback typing so builds work even if @types/nodemailer is not installed yet.
  const nodemailer: any;
  export default nodemailer;
}
