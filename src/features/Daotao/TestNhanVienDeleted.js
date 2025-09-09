import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getAllNhanVienDeleted } from "features/NhanVien/nhanvienSlice";

function TestNhanVienDeleted() {
  const dispatch = useDispatch();
  const { nhanviensDeleted, isLoading, error } = useSelector(
    (state) => state.nhanvien
  );

  useEffect(() => {
    console.log("TestNhanVienDeleted: calling getAllNhanVienDeleted");
    dispatch(getAllNhanVienDeleted());
  }, [dispatch]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Test NhanVien Deleted</h1>
      <p>Loading: {isLoading ? "Yes" : "No"}</p>
      <p>Error: {error || "None"}</p>
      <p>Deleted NhanViens: {nhanviensDeleted?.length || 0}</p>

      <h2>Data:</h2>
      <pre>{JSON.stringify(nhanviensDeleted, null, 2)}</pre>
    </div>
  );
}

export default TestNhanVienDeleted;
