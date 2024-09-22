import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/options';
import dbConnect from '@/lib/dbConnect';
import UserModel from '@/model/User';
import { User } from 'next-auth';

export async function POST(request: Request) {
  // Connect to the database
  await dbConnect();

  const session = await getServerSession(authOptions);
  const user: User = session?.user;
  if (!session || !user) {
    return new Response(
      JSON.stringify({ success: false, message: 'Not authenticated' }),
      { status: 401 }
    );
  }

  const { email } = user;  // Use the email field
  const { acceptMessages } = await request.json();

  try {
    // Update the user's message acceptance status using email
    const updatedUser = await UserModel.findOneAndUpdate(
      { email }, // Find the user by email
      { isAcceptingMessages: acceptMessages },
      { new: true }
    );

    if (!updatedUser) {
      // User not found
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Unable to find user to update message acceptance status',
        }),
        { status: 404 }
      );
    }

    // Successfully updated message acceptance status
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Message acceptance status updated successfully',
        updatedUser,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating message acceptance status:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error updating message acceptance status',
      }),
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Connect to the database
  await dbConnect();

  // Get the user session
  const session = await getServerSession(authOptions);
  const user = session?.user;

  // Check if the user is authenticated
  if (!session || !user) {
    return new Response(
      JSON.stringify({ success: false, message: 'Not authenticated' }),
      { status: 401 }
    );
  }

  const { email } = user; // Use the email field

  try {
    // Retrieve the user from the database using the email
    const foundUser = await UserModel.findOne({ email });

    if (!foundUser) {
      // User not found
      return new Response(
        JSON.stringify({ success: false, message: 'User not found' }),
        { status: 404 }
      );
    }

    // Return the user's message acceptance status
    return new Response(
      JSON.stringify({
        success: true,
        isAcceptingMessages: foundUser.isAcceptingMessages,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error retrieving message acceptance status:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Error retrieving message acceptance status',
      }),
      { status: 500 }
    );
  }
}
