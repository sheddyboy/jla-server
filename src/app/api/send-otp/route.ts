import { dataObject, errorObject } from "@/utils";
import twilio from "twilio";

const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SERVICE_SID } =
  process.env;

const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

export async function POST(request: Request) {
  try {
    const { phoneNumber } = await request.json();

    if (!phoneNumber)
      return errorObject(new Error("Phone number is required"), 400);

    await client.verify.v2
      .services(TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({ to: phoneNumber, channel: "sms" });

    return dataObject(true, 200);
  } catch (error) {
    if (
      error instanceof Error &&
      "code" in error &&
      typeof error.code === "number"
    ) {
      if (error.code === 60200) {
        console.log({ errorCode: error.code });
        console.log({ errorMessage: error.message });
        return errorObject(new Error("Invalid Number"), 400);
      } else if (error.code === 60203) {
        // max attempt
        console.log({ errorCode: error.code });
        console.log({ errorMessage: error.message });
        return errorObject(new Error(`${error.message}`), 400);
      } else {
        console.log({ errorCode: error.code });
        console.log({ errorMessage: error.message });
        return errorObject(new Error(`${error.message}`), 500);
      }
    }
    console.log({ error });
    return errorObject(new Error(`Failed to send OTP`), 500);
  }
}
