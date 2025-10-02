import { NextRequest, NextResponse } from 'next/server';
import { readStudentsData } from '@/lib/students/storage';

type RouteContext = {
	params: Promise<{ id: string }> | { id: string };
};

export async function GET(_request: NextRequest, context: RouteContext) {
	const { id } = await Promise.resolve(context.params);

	if (!id) {
		return NextResponse.json(
			{ message: 'error', error: 'ID is required' },
			{ status: 400 }
		);
	}

	const students = await readStudentsData();
	const student = students.find((entry) => entry.id === id);

	if (!student) {
		return NextResponse.json(
			{ message: 'error', error: 'Student not found' },
			{ status: 404 }
		);
	}

	return NextResponse.json({ message: 'success', data: student });
}
