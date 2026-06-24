import { TextField } from "@mui/material";
import TitleBar from "../TitleBar";
import React, { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import axios from "axios";
import Cookies from "js-cookie";
import { baseUrl } from "../../apiConfig";
import EventPopups from "../Reusable/EventPopups";
import { invalidateMenuAccessCache } from "../Hooks/useMenuAccess";

// Permissions will be fetched dynamically from API

const defaultPermissionState = (menuList = []) => {
  const state = {};
  menuList.forEach((menu) => {
    const key = `menu_${menu.menuid || menu.MenuId}`;
    state[key] = { read: false, write: false, update: false, delete: false, mobile: false };
  });
  return state;
};

const handlePermissionChange = (permKey, type, checked, permissionState, setPermissionState) => {
  setPermissionState((prev) => ({
    ...prev,
    [permKey]: {
      ...prev[permKey],
      [type]: checked,
    },
  }));  
};

const RoleModal = ({
  show,
  onHide,
  onSave,
  isEdit,
  roleData,
  setRoleData,
  permissionState,
  setPermissionState,
  menuList = [],
  loading = false,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered size="xl">
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? "Edit Role" : "Create role"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-3">
          <TextField
            label="Role name"
            variant="outlined"
            type="text"
            value={roleData.title}
            onChange={(e) =>
              setRoleData({ ...roleData, title: e.target.value })
            }
            required
            size="small"
            disabled={loading}
            style={{ width: "200px" }}
          />
        </Form.Group>
        <h5 className="mb-1">Permissions</h5>
        {menuList.length === 0 ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Loading permissions...</span>
            </div>
          </div>
        ) : (
          <div className="table-responsive" style={{ maxHeight: "500px", overflowY: "auto" }}>
            <table className="table table-bordered table-hover">
              <thead className="table-light" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  <th className="fw-bold">Role Name</th>
                  <th className="text-center">Read</th>
                  <th className="text-center">Create</th>
                  <th className="text-center">Update</th>
                  <th className="text-center">Delete</th>
                  <th className="text-center">Mobile</th>
                </tr>
              </thead>
              <tbody>
                {menuList.map((menuItem, idx) => {
                  const menuId = menuItem.menuid || menuItem.MenuId;
                  const menuName = menuItem.menu?.Name || menuItem.Name || `Menu ${menuId}`;
                  const key = `menu_${menuId}`;
                  // Check if isMobile is not null or undefined (i.e., it's either true or false)
                  const isMobile = menuItem.menu?.isMobile !== undefined && menuItem.menu?.isMobile !== null 
                    ? menuItem.menu.isMobile 
                    : (menuItem.isMobile !== undefined && menuItem.isMobile !== null ? menuItem.isMobile : null);
                  const showMobile = isMobile === true; // Show mobile only if isMobile is explicitly true
                  return (
                    <tr key={idx}>
                      <td className="fw-bold">{menuName}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={permissionState[key]?.read || false}
                          onChange={(e) =>
                            handlePermissionChange(
                              key,
                              "read",
                              e.target.checked,
                              permissionState,
                              setPermissionState
                            )
                          }
                          id={`read-${key}`}
                          disabled={loading}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={permissionState[key]?.write || false}
                          onChange={(e) =>
                            handlePermissionChange(
                              key,
                              "write",
                              e.target.checked,
                              permissionState,
                              setPermissionState
                            )
                          }
                          id={`write-${key}`}
                          disabled={loading}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={permissionState[key]?.update || false}
                          onChange={(e) =>
                            handlePermissionChange(
                              key,
                              "update",
                              e.target.checked,
                              permissionState,
                              setPermissionState
                            )
                          }
                          id={`update-${key}`}
                          disabled={loading}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={permissionState[key]?.delete || false}
                          onChange={(e) =>
                            handlePermissionChange(
                              key,
                              "delete",
                              e.target.checked,
                              permissionState,
                              setPermissionState
                            )
                          }
                          id={`delete-${key}`}
                          disabled={loading}
                        />
                      </td>
                      <td className="text-center">
                        {showMobile ? (
                          <input
                            type="checkbox"
                            className="form-check-input"
                            checked={permissionState[key]?.mobile || false}
                            onChange={(e) =>
                              handlePermissionChange(
                                key,
                                "mobile",
                                e.target.checked,
                                permissionState,
                                setPermissionState
                              )
                            }
                            id={`mobile-${key}`}
                            disabled={loading}
                          />
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="d-flex justify-content-end mt-4">
          <Button variant="secondary" onClick={onHide} className="me-2" disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" onClick={onSave} disabled={loading}>
            {loading ? "Saving..." : isEdit ? "Save Changes" : "Create Role"}
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export const RoleAndPermision = () => {
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [roleData, setRoleData] = useState({ title: "", roleId: 0 });
  const [permissionState, setPermissionState] = useState(defaultPermissionState());
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openSnackBar, setOpenSnackBar] = useState(false);
  const [snackBarColor, setSnackBarColor] = useState("");
  const [snackBarText, setSnackBarText] = useState("");
  const [deleteConfirmModal, setDeleteConfirmModal] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState(null);
  const [menuList, setMenuList] = useState([]);
  const [loadingMenus, setLoadingMenus] = useState(false);

  const headers = {
    Authorization: `Bearer ${Cookies.get("token")}`,
    "Content-Type": "application/json",
  };

  const handlePopup = (open, color, text) => {
    setOpenSnackBar(open);
    setSnackBarColor(color);
    setSnackBarText(text);
  };

  // Fetch roles from API
  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseUrl}/api/UserManagement/Roles`, { headers });
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          setRoles(response.data);
        } else if (response.data.Roles) {
          setRoles(response.data.Roles);
        } else if (response.data.Data && Array.isArray(response.data.Data)) {
          setRoles(response.data.Data);
        } else {
          setRoles([response.data]);
        }
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      handlePopup(true, "error", error.response?.data || "Failed to fetch roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchMenuList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch menu list for permissions
  const fetchMenuList = async () => {
    setLoadingMenus(true);
    try {
      // Fetch with id=0 to get all available menus
      const response = await axios.get(`${baseUrl}/api/Staff/RolesPermission?id=0`, { headers });
      const apiData = response.data;
      
      if (apiData?.SelectedMenuAccess && Array.isArray(apiData.SelectedMenuAccess)) {
        setMenuList(apiData.SelectedMenuAccess);
      } else if (Array.isArray(apiData)) {
        setMenuList(apiData);
      } else {
        setMenuList([]);
      }
    } catch (error) {
      console.error("Error fetching menu list:", error);
      handlePopup(true, "error", "Failed to fetch menu list");
      setMenuList([]);
    } finally {
      setLoadingMenus(false);
    }
  };

  // Convert permission state to API format
  const convertPermissionsToAPI = (permissions, roleId, existingAccessLevels = []) => {
    const accessLevels = [];
    menuList.forEach((menuItem) => {
      const menuId = menuItem.menuid || menuItem.MenuId;
      const key = `menu_${menuId}`;
      const permData = permissions[key];
      
      if (permData) {
        // Find existing access level for this menu
        const existing = existingAccessLevels.find(
          (ea) => (ea.menuid || ea.MenuId) === menuId && (ea.roleid || ea.RoleId) === roleId
        );
        
        accessLevels.push({
          AccessId: existing?.accesslevelid || existing?.AccessId || 0,
          EditAccess: permData.update || false,
          DeleteAccess: permData.delete || false,
          CreateAccess: permData.write || false,
          MobileAccess: permData.mobile || false,
          MenuId: menuId,
          RoleId: roleId,
          isActive: permData.read || permData.write || permData.update || permData.delete || false,
        });
      }
    });
    return accessLevels;
  };

  // Convert API permissions to local state
  const convertAPIToPermissions = (apiResponse, availableMenus = []) => {
    const permissions = defaultPermissionState(availableMenus);
    
    // Handle the new API response structure
    let menuAccessArray = [];
    if (apiResponse) {
      if (apiResponse.SelectedMenuAccess && Array.isArray(apiResponse.SelectedMenuAccess)) {
        menuAccessArray = apiResponse.SelectedMenuAccess;
      } else if (Array.isArray(apiResponse)) {
        menuAccessArray = apiResponse;
      }
    }
    
    menuAccessArray.forEach((apiPerm) => {
      const menuId = apiPerm.menuid || apiPerm.MenuId;
      const key = `menu_${menuId}`;
      const menuIsMobile = apiPerm.menu?.isMobile !== undefined && apiPerm.menu?.isMobile !== null 
        ? apiPerm.menu.isMobile 
        : (apiPerm.isMobile !== undefined && apiPerm.isMobile !== null ? apiPerm.isMobile : null);
      permissions[key] = {
        read: apiPerm.isactive === true || apiPerm.isActive === true || false,
        write: apiPerm.accesscreate === true || apiPerm.CreateAccess === true || false,
        update: apiPerm.accessedit === true || apiPerm.EditAccess === true || false,
        delete: apiPerm.accessdelete === true || apiPerm.DeleteAccess === true || false,
        mobile: apiPerm.MobileAccess === true || false,
      };
    });
    
    return permissions;
  };

  const handleCreateRole = () => {
    setRoleData({ title: "", roleId: 0 });
    setPermissionState(defaultPermissionState(menuList));
    setIsEdit(false);
    setShowModal(true);
  };

  const handleEditRole = async (role) => {
    setLoading(true);
    try {
      // Fetch role permissions
      const response = await axios.get(
        `${baseUrl}/api/Staff/RolesPermission?id=${role.RoleId || role.roleId}`,
        { headers }
      );
      
      // Handle the API response structure
      const apiData = response.data;
      const selectedRole = apiData?.SelectedRole || apiData;
      const roleId = selectedRole?.RoleId || role.RoleId || role.roleId;
      const roleName = selectedRole?.Role || role.Role || role.title;
      
      // Extract menu list from response if available, otherwise use existing menuList
      let availableMenus = menuList;
      if (apiData?.SelectedMenuAccess && Array.isArray(apiData.SelectedMenuAccess)) {
        availableMenus = apiData.SelectedMenuAccess;
        // Update menuList if it's empty or different
        if (menuList.length === 0 || menuList.length !== availableMenus.length) {
          setMenuList(availableMenus);
        }
      }
      
      const permissions = convertAPIToPermissions(apiData, availableMenus);
      setRoleData({ title: roleName, roleId: roleId });
      setPermissionState(permissions);
      setIsEdit(true);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching role permissions:", error);
      handlePopup(true, "error", "Failed to fetch role permissions");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRole = async () => {
    if (!roleData.title.trim()) {
      handlePopup(true, "error", "Role name is required");
      return;
    }

    setLoading(true);
    try {
      // Create or update role
      const roleResponse = await axios.post(
        `${baseUrl}/api/staff/CreateRole`,
        {
          RoleId: isEdit ? roleData.roleId : 0,
          Role: roleData.title,
        },
        { headers }
      );

      const newRoleId = roleResponse.data?.RoleId || roleData.roleId;
      
      // If editing, fetch existing access levels to get AccessIds
      let existingAccessLevels = [];
      if (isEdit) {
        try {
          const permResponse = await axios.get(
            `${baseUrl}/api/Staff/RolesPermission?id=${newRoleId}`,
            { headers }
          );
          const apiData = permResponse.data;
          if (apiData?.SelectedMenuAccess && Array.isArray(apiData.SelectedMenuAccess)) {
            existingAccessLevels = apiData.SelectedMenuAccess;
          } else if (Array.isArray(apiData)) {
            existingAccessLevels = apiData;
          }
        } catch (error) {
          console.error("Error fetching existing permissions:", error);
        }
      }
      
      // Create access levels with AccessId if editing
      const accessLevels = convertPermissionsToAPI(permissionState, newRoleId, existingAccessLevels);
      
      await axios.post(
        `${baseUrl}/api/Staff/CreateAccessLevel`,
        accessLevels,
        { headers }
      );

      // Clear menu access cache so all components refresh with new permissions
      invalidateMenuAccessCache();

      handlePopup(true, "success", isEdit ? "Role updated successfully" : "Role created successfully");
      setShowModal(false);
      fetchRoles();
    } catch (error) {
      console.error("Error saving role:", error);
      handlePopup(true, "error", error.response?.data || "Failed to save role");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRole = async (role, isConfirm = false) => {
    if (!isConfirm) {
      setRoleToDelete(role);
      setDeleteConfirmModal(true);
      return;
    }

    setLoading(true);
    try {
      await axios.delete(
        `${baseUrl}/api/Staff/DeleteRole?id=${role.RoleId || role.roleId}&isConfirm=${isConfirm}`,
        { headers }
      );
      handlePopup(true, "success", "Role deleted successfully");
      setDeleteConfirmModal(false);
      setRoleToDelete(null);
      fetchRoles();
    } catch (error) {
      console.error("Error deleting role:", error);
      handlePopup(true, "error", error.response?.data || "Failed to delete role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <EventPopups
        open={openSnackBar}
        setOpen={setOpenSnackBar}
        color={snackBarColor}
        text={snackBarText}
      />
      <TitleBar title="Roles & Permissions" />
      <div className="container-fluid ">
        <div className="d-flex justify-content-between align-items-center mb-4">
          {/* <button className="btn btn-primary" onClick={handleCreateRole} disabled={loading}>
            Create role
          </button> */}
        </div>
        {loading && roles.length === 0 ? (
          <div className="text-center py-5">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        ) : (
          <div className="row g-4">
            {roles.map((role, idx) => (
              <div className="col-12 col-sm-6 col-md-3" key={idx}>
                <div className="card h-100 shadow-sm border-0 rounded-4">
                  <div className="card-body ">
                    <h6 className="fw-bold ">{role.Role || role.title}</h6>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                      <button
                        className="btn btn-link d-flex align-items-center fw-bold p-0"
                        onClick={() => handleEditRole(role)}
                        style={{ textDecoration: "none" }}
                      >
                        Edit role <span className="ms-2">&rarr;</span>
                      </button>
                      {/* <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteRole(role)}
                        disabled={loading}
                      >
                        Delete
                      </button> */}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <RoleModal
        show={showModal}
        onHide={() => setShowModal(false)}
        onSave={handleSaveRole}
        isEdit={isEdit}
        roleData={roleData}
        setRoleData={setRoleData}
        permissionState={permissionState}
        setPermissionState={setPermissionState}
        menuList={menuList}
        loading={loading || loadingMenus}
      />
      {/* Delete Confirmation Modal */}
      <Modal show={deleteConfirmModal} onHide={() => setDeleteConfirmModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete the role "{roleToDelete?.Role || roleToDelete?.title}"? This action cannot be undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setDeleteConfirmModal(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => handleDeleteRole(roleToDelete, true)}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};
