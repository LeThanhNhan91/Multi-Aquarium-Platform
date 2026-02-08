import { buildCrudEndpoints } from "@/libs/redux/baseCrudApi";
import { baseQueryWithReauth } from "@/libs/redux/baseApi";
import { createApi } from "@reduxjs/toolkit/query/react";

/**
 * Interface cho Classroom entity
 */
export interface Classroom {
  id: string;
  name: string;
  description?: string;
  teacherId: string;
  studentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Classroom API - Sử dụng buildCrudEndpoints để tự động tạo các CRUD endpoints
 */
export const classroomApi = createApi({
  reducerPath: "classroomApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Classroom"],
  endpoints: (builder) => ({
    // Spread tất cả các CRUD endpoints cơ bản
    ...buildCrudEndpoints<Classroom>(builder, {
      resourcePath: "classrooms",
      tagType: "Classroom",
    }),

    // Thêm custom endpoints cho các logic đặc biệt
    getClassroomsByTeacher: builder.query<Classroom[], string>({
      query: (teacherId) => `/classrooms/teacher/${teacherId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: "Classroom" as const, id })),
              { type: "Classroom", id: "TEACHER_LIST" },
            ]
          : [{ type: "Classroom", id: "TEACHER_LIST" }],
    }),

    enrollStudent: builder.mutation<
      void,
      { classroomId: string; studentId: string }
    >({
      query: ({ classroomId, studentId }) => ({
        url: `/classrooms/${classroomId}/enroll`,
        method: "POST",
        body: { studentId },
      }),
      invalidatesTags: (result, error, { classroomId }) => [
        { type: "Classroom", id: classroomId },
      ],
    }),
  }),
});

/**
 * Export hooks với tên custom theo entity
 * Đây là pattern để sử dụng trong component
 */
export const {
  // CRUD hooks từ buildCrudEndpoints
  useGetAllQuery: useGetAllClassroomsQuery,
  useGetByIdQuery: useGetClassroomByIdQuery,
  useSearchQuery: useSearchClassroomsQuery,
  useCreateMutation: useCreateClassroomMutation,
  useUpdateMutation: useUpdateClassroomMutation,
  useDeleteMutation: useDeleteClassroomMutation,

  // Custom hooks
  useGetClassroomsByTeacherQuery,
  useEnrollStudentMutation,
} = classroomApi;
