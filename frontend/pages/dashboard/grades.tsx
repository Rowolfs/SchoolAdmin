// frontend/pages/dashboard/grades.tsx

import React, { useState, useEffect, useMemo } from 'react';
import { NextPageWithLayout } from '@/pages/_app';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { verifyTokenOnServer, UserPayload } from '@/utils/auth';
import { GetServerSideProps } from 'next';
import { GradesAPI, DisciplineClass, Pupil, Grade } from '@/utils/gradesAPI';

type Props = { user: UserPayload };

const GradesPage: NextPageWithLayout<Props> = ({ user }) => {
  const [options, setOptions] = useState<DisciplineClass[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<number | null>(null);
  const [selectedClass, setSelectedClass] = useState<{ id: number; name: string } | null>(null);
  const [pupils, setPupils] = useState<Pupil[]>([]);
  const [markValues, setMarkValues] = useState<Record<number, string>>({});

  // Шаг 1: получить список дисциплин+классов учителя
  useEffect(() => {
    GradesAPI.getTeacherClasses(user.id)
      .then(setOptions)
      .catch(err => console.error('Ошибка getTeacherClasses:', err));
  }, [user.id]);

  // Уникальные предметы
  const disciplines = useMemo(() => {
    const map = new Map<number, string>();
    options.forEach(o => map.set(o.discipline.id, o.discipline.name));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [options]);

  // Классы для выбранного предмета
  const classes = useMemo(() => {
    if (selectedDiscipline == null) return [];
    return options
      .filter(o => o.discipline.id === selectedDiscipline)
      .map(o => o.class);
  }, [options, selectedDiscipline]);

  // Шаг 3: при выборе класса загрузить учеников и оценки
  useEffect(() => {
    if (selectedClass == null || selectedDiscipline == null) return;

    const clsId = selectedClass.id;
    const pair = options.find(o =>
      o.discipline.id === selectedDiscipline && o.class.id === clsId
    );
    if (!pair) return;
    const dtId = pair.disciplineTeacherId;

    GradesAPI.getPupilsByClass(clsId)
      .then(setPupils)
      .catch(err => console.error('Ошибка getPupilsByClass:', err));

    GradesAPI.getGrades(clsId, dtId, 1)
      .then(grs => {
        const init: Record<number,string> = {};
        grs.forEach(g => { init[g.pupilId] = g.mark.toString(); });
        setMarkValues(init);
      })
      .catch(err => console.error('Ошибка getGrades:', err));
  }, [selectedClass, selectedDiscipline, options]);

  const handleSave = async (pupilId: number) => {
    if (!selectedClass || selectedDiscipline == null) return;

    const clsId = selectedClass.id;
    const dtId = options.find(o =>
      o.discipline.id === selectedDiscipline && o.class.id === clsId
    )!.disciplineTeacherId;
    const mark = parseFloat(markValues[pupilId] || '0');

    try {
      await GradesAPI.addOrUpdateGrade({ classId: clsId, disciplineTeacherId: dtId, pupilId, quarter: 1, mark });
      const updated = await GradesAPI.getGrades(clsId, dtId, 1);
      const init: Record<number,string> = {};
      updated.forEach(g => { init[g.pupilId] = g.mark.toString(); });
      setMarkValues(init);
    } catch (err) {
      console.error('Ошибка addOrUpdateGrade или refresh:', err);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Панель оценок</h1>

      {selectedDiscipline == null ? (
        // Шаг 1: выбор предмета
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {disciplines.map(d => (
            <button
              key={d.id}
              onClick={() => { setSelectedDiscipline(d.id); setSelectedClass(null); }}
              className="h-32 border rounded shadow-md hover:bg-gray-800 flex items-center justify-center text-lg"
            >
              {d.name}
            </button>
          ))}
        </div>
      ) : selectedClass == null ? (
        // Шаг 2: выбор класса
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {classes.map(c => (
            <button
              key={c.id}
              onClick={() => setSelectedClass(c)}
              className="h-32 border rounded shadow-md hover:bg-gray-800 flex items-center justify-center text-lg"
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={() => setSelectedDiscipline(null)}
            className="col-span-full text-sm text-blue-400 hover:underline"
          >
            ← Выбрать другой предмет
          </button>
        </div>
      ) : (
        // Шаг 3: таблица оценок
        <div>
          <button
            onClick={() => setSelectedClass(null)}
            className="text-sm text-blue-400 hover:underline mb-4"
          >
            ← Выбрать другой класс
          </button>
          <table className="min-w-full border-collapse border">
            <thead>
              <tr>
                <th className="border p-2">Ученик</th>
                <th className="border p-2">Оценка</th>
                <th className="border p-2">Сохранить</th>
              </tr>
            </thead>
            <tbody>
              {pupils.map(p => (
                <tr key={p.id}>
                  <td className="border p-2">
                    {p.user.surname} {p.user.name}
                  </td>
                  <td className="border p-2">
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={markValues[p.id]||''}
                      onChange={e => setMarkValues(prev => ({ ...prev, [p.id]: e.target.value }))}
                      className="border p-1 w-16"
                    />
                  </td>
                  <td className="border p-2">
                    <button
                      onClick={() => handleSave(p.id)}
                      className="bg-blue-600 text-white px-3 py-1 rounded"
                    >
                      Сохранить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps<Props> = async ctx => {
  const user = await verifyTokenOnServer(ctx);
  if (!user) {
    return { redirect: { destination: '/auth/login', permanent: false } };
  }
  return { props: { user } };
};

GradesPage.getLayout = page => (
  <DashboardLayout user={page.props.user}>{page}</DashboardLayout>
);

export default GradesPage;
